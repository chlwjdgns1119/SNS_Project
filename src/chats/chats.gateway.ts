import { MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway({
    namespace: 'chats',
})
export class ChatsGateway implements OnGatewayConnection{

    @WebSocketServer()
    server: Server;

    handleConnection(socket: Socket) {
        console.log(`on connect called: ${socket.id}`);
    }

    @SubscribeMessage('send_message')
    sendMessage(
        @MessageBody() message: string,
    ){
        this.server.emit('receieve_message', 'hello from server');
    }
}