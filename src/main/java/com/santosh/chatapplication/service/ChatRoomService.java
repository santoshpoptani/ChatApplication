package com.santosh.chatapplication.service;

import com.santosh.chatapplication.chatroom.ChatRoom;
import com.santosh.chatapplication.repository.ChatRoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ChatRoomService {

    @Autowired
    private ChatRoomRepository chatRoomRepository;

    public Optional<String> getChatRoomId(String senderId, String reciverId, boolean createRoomIfNotExists) {

        return chatRoomRepository.findBySenderIdAndReciverId(senderId, reciverId)
                .map(ChatRoom::getChatId)
                .or(() -> {
                            if (createRoomIfNotExists) {
                                var chatId = createChatId(senderId , reciverId);
                                return Optional.of(chatId);
                            }
                            return Optional.empty();
                        });
    }

    private String createChatId(String senderId, String reciverId) {
        var chatId = String.format("%s_%s",senderId,reciverId);//user1_user2  -> user1 sender ,user2 reciver
        ChatRoom senderreciver = ChatRoom.builder()
                .chatId(chatId)
                .senderId(senderId)
                .reciverId(reciverId)
                .build();

        ChatRoom reciversender = ChatRoom.builder()
                .chatId(chatId)
                .senderId(reciverId)
                .reciverId(senderId)
                .build();
            chatRoomRepository.save(senderreciver);
            chatRoomRepository.save(reciversender);
        return  chatId;
    }
}
