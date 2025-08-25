package com.aiscanner.dto;

import lombok.Data;

@Data
public class ChatRequest {
    private String question;
    private String url;
    private String pageContent;
}
