package com.aiscanner.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatResponse {
    private String answer;
    private String question;
    private String url;
    private long timestamp;
    private String error;
}
