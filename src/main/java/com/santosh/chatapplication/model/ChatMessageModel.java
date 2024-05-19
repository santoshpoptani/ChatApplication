package com.santosh.chatapplication.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Document
public class ChatMessageModel {
    @Id
    private String id;
    private String chatId;
    private String senderId;
    private String reciverId;
    private String content;
    private Date timestamp;
}
