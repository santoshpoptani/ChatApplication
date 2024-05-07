package com.santosh.chatapplication.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    private String senderName;
    private String reciverName;
    private String message;
    private String date;
    private Status status;
}
