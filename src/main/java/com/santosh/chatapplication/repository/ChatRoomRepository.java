package com.santosh.chatapplication.repository;

import com.santosh.chatapplication.chatroom.ChatRoom;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ChatRoomRepository extends MongoRepository<ChatRoom , String> {

    Optional<ChatRoom> findBySenderIdAndReciverId(String senderId, String reciverId);
}
