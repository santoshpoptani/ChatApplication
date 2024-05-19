package com.santosh.chatapplication.controller;

import com.santosh.chatapplication.chatnotification.ChatNotification;
import com.santosh.chatapplication.model.ChatMessageModel;
import com.santosh.chatapplication.model.User;
import com.santosh.chatapplication.service.ChatMessageService;
import com.santosh.chatapplication.service.UserService;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Controller
@AllArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    @Autowired
    private UserService userService;
    @Autowired
    private ChatMessageService chatMessageService;
    @Autowired
    private  final SimpMessagingTemplate template;

    @MessageMapping("/chat.sendMessage")
    @SendTo("/topic/public")
    public ChatMessage sendMessage(@Payload ChatMessage message){
        return message;
    }

    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage message, SimpMessageHeaderAccessor messageHeaderAccessor){
        messageHeaderAccessor.getSessionAttributes().put("username", message.getSender());
        return message;
    }

    @MessageMapping("/chat.addUser/{userId}/private")
    @SendTo("/user/{userId}/private")
    public User addUser(@Payload User user, @DestinationVariable("userId") String userId){
        userService.saveUser(user);
        System.out.println(user + "Added user to db and connected");
        return user;
    }

    @MessageMapping("/chat.disconnectUser")
    @SendTo("/user/private")
    public User disconnectUser(@Payload User user){
        userService.disconnectUser(user);
        return  user;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> findConnectedUsers(){
        return ResponseEntity.ok(userService.findConnectedUser());
    }

    //reterving Chat Message
    @GetMapping("/message/{senderId}/{reciverId}")
    public  ResponseEntity<List<ChatMessageModel>> getMessage(@PathVariable("senderId") String senderId,
                                                              @PathVariable("reciverId") String reciverId)
    {
        return ResponseEntity.ok(chatMessageService.findChatMessages(senderId , reciverId));
    }

    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessageModel chatMessageModel){
        ChatMessageModel chatsave = chatMessageService.save(chatMessageModel);
        //jhon/queue/messages -> jhon will subscribe to this
        template.convertAndSendToUser(chatMessageModel.getReciverId(),
                "/queue/messages",
                ChatNotification.builder()
                        .id(chatsave.getId())
                        .senderId(chatsave.getSenderId())
                        .reciverId(chatsave.getReciverId())
                        .content(chatsave.getContent())
                        .build()
                );

    }
}
