from drf_spectacular.utils import extend_schema,OpenApiParameter
from drf_spectacular.types import OpenApiTypes
from .serializer import ServerSerializer, ChannelSerializer

server_list_docs = extend_schema(
    responses=ServerSerializer(many=True),
    parameters=[
        OpenApiParameter(name="category", type=OpenApiTypes.STR, location= OpenApiParameter.QUERY, description="Category of server to retrieve", required=False),
        OpenApiParameter(name="qty", type=OpenApiTypes.INT, location= OpenApiParameter.QUERY, description="Number of servers to retrieve", required=False),
        OpenApiParameter(name="by_user", type=OpenApiTypes.BOOL, location= OpenApiParameter.QUERY, description="Filter by user ID", required=False),
        OpenApiParameter(name="by_serverid", type=OpenApiTypes.INT, location= OpenApiParameter.QUERY, description="Filter by server ID", required=False),
        OpenApiParameter(name="with_num_members", type=OpenApiTypes.BOOL, location= OpenApiParameter.QUERY, description="Include number of members", required=False),

    ]
)