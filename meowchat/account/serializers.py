from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Account

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name", "image"]


class RegistrationSerializer(serializers.ModelSerializer):
    confirm_password = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ["username", "first_name", "last_name", "password", "confirm_password"]
    
    def validate(self, data):
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        
        if password != confirm_password:
            raise serializers.ValidationError({'confirm_password': "Passwords don't match."})
        
        return data
    
    def save(self):
        username = self.validated_data['username']
        first_name = self.validated_data.get('first_name', '')
        last_name = self.validated_data.get('last_name', '')
        password = self.validated_data['password']

        account = User(username=username, first_name=first_name, last_name=last_name)
        account.set_password(password)
        account.save()
        return account


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True)


# Keep for backwards compatibility
class AccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ("username",)


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ("username", "password")

    def is_valid(self, raise_exception=False):
        valid = super().is_valid(raise_exception=raise_exception)

        if valid:
            username = self.validated_data["username"]
            if Account.objects.filter(username=username).exists():
                self._errors["username"] = ["username already exists"]
                valid = False

        return valid

    def create(self, validated_data):
        user = Account.objects.create_user(**validated_data)
        return user
