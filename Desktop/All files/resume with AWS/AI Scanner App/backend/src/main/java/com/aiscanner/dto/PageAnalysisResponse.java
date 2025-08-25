package com.aiscanner.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class PageAnalysisResponse {
    private String url;
    private String title;
    private List<FieldInfo> fields;
    private String pageSummary;
    private String error;
    private AIAnalysisDetails aiAnalysis;
    private String demoForm; // Generated dummy form based on analysis
    private String pageContent; // Extracted page content
    private String codeContent; // Extracted code content
    private String questionsContent; // Extracted questions and prompts
    
    @Data
    @Builder
    public static class FieldInfo {
        private String name;
        private String label;
        private String type;
        private String description;
        private String placeholder;
        private boolean required;
        private String aiExplanation;
        private String validationRules;
        private String bestPractices;
        private String securityNotes;
    }
    
    @Data
    @Builder
    public static class AIAnalysisDetails {
        private String pagePurpose;
        private String userExperienceAssessment;
        private String formComplexity;
        private String potentialImprovements;
        private String accessibilityConsiderations;
        private String businessInsights;
        private long analysisTimestamp;
        private String aiModel;
    }
}
