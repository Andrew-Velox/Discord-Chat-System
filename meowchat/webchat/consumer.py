from asgiref.sync import async_to_sync
from channels.generic.websocket import JsonWebsocketConsumer
from django.contrib.auth import get_user_model
from server.models import Server

from .models import Conversation, Message

User = get_user_model()


class WebChatConsumer(JsonWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.channel_id = None
        self.user = None

    def connect(self):
        self.user = self.scope["user"]
        print(f"WebSocket connection attempt - User: {self.user}, Authenticated: {self.user.is_authenticated}")
        
        self.accept()

        if not self.user.is_authenticated:
            print("WebSocket: User not authenticated, closing connection with code 4001")
            self.close(code=4001)
            return

        self.channel_id = self.scope["url_route"]["kwargs"]["channelId"]
        server_id = self.scope["url_route"]["kwargs"]["serverId"]
        
        print(f"WebSocket: Connecting to server {server_id}, channel {self.channel_id}")

        try:
            self.user = User.objects.get(id=self.user.id)
            server = Server.objects.get(id=server_id)
            self.is_member = server.member.filter(id=self.user.id).exists()
            
            print(f"WebSocket: User {self.user.username} is member of server {server.name}: {self.is_member}")
            
            async_to_sync(self.channel_layer.group_add)(self.channel_id, self.channel_name)
            print(f"WebSocket: Successfully connected to channel {self.channel_id}")
            
        except Server.DoesNotExist:
            print(f"WebSocket: Server {server_id} not found, closing connection")
            self.close(code=4004)
        except Exception as e:
            print(f"WebSocket: Error during connection: {e}")
            self.close(code=4000)

    def receive_json(self, content):
        if not self.is_member:
            return

        channel_id = self.channel_id
        sender = self.user
        message = content["message"]

        conversation, created = Conversation.objects.get_or_create(channel_id=channel_id)

        new_message = Message.objects.create(conversation=conversation, sender=sender, content=message)

        async_to_sync(self.channel_layer.group_send)(
            self.channel_id,
            {
                "type": "chat.message",
                "new_message": {
                    "id": new_message.id,
                    "sender": new_message.sender.username,
                    "content": new_message.content,
                    "timestamp": new_message.timestamp.isoformat(),
                },
            },
        )

    def chat_message(self, event):
        self.send_json(event)

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(self.channel_id, self.channel_name)
        super().disconnect(close_code)
