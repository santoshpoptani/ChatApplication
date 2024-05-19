package com.santosh.chatapplication.repository;

import com.santosh.chatapplication.model.ChatMessageModel;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatMessageRepository extends MongoRepository<ChatMessageModel, String> {

    List<ChatMessageModel> findByChatId(String s);
}
