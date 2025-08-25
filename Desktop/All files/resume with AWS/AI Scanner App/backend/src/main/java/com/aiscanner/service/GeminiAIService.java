package com.aiscanner.service;

import com.aiscanner.dto.PageAnalysisResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@Slf4j
public class GeminiAIService {
    
    @Value("${gemini.api.key}")
    private String apiKey;
    
    @Value("${gemini.model.name:gemini-pro}")
    private String modelName;
    
    @Value("${gemini.max.tokens:2048}")
    private int maxTokens;
    
    @Value("${gemini.temperature:0.7}")
    private float temperature;
    
    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    
    public GeminiAIService() {
        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta/models")
                .build();
        this.objectMapper = new ObjectMapper();
    }
    
    public CompletableFuture<String> analyzePageWithAI(String url, String title, String htmlContent, List<PageAnalysisResponse.FieldInfo> fields) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String prompt = buildAnalysisPrompt(url, title, htmlContent, fields);
                return callGeminiAPI(prompt);
            } catch (Exception e) {
                log.error("Error in Gemini AI analysis for URL: {}", url, e);
                return generateFallbackAnalysis(url, title, fields);
            }
        });
    }
    
    public CompletableFuture<String> analyzeFieldWithAI(String fieldName, String fieldType, String fieldLabel, String placeholder, String context) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String prompt = buildFieldAnalysisPrompt(fieldName, fieldType, fieldLabel, placeholder, context);
                return callGeminiAPI(prompt);
            } catch (Exception e) {
                log.error("Error in Gemini AI field analysis for field: {}", fieldName, e);
                return generateFallbackFieldExplanation(fieldName, fieldType, fieldLabel, placeholder);
            }
        });
    }
    
    public CompletableFuture<String> answerQuestionAboutPage(String question, String pageContent, List<PageAnalysisResponse.FieldInfo> fields, 
                                                             String fullPageContent, String codeContent, String questionsContent) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                // Check if this is a general question (not about the current page)
                if (isGeneralQuestion(question)) {
                    String prompt = buildGeneralQuestionPrompt(question);
                    return callGeminiAPI(prompt);
                } else {
                    String prompt = buildAdvancedQuestionAnsweringPrompt(question, pageContent, fields, fullPageContent, codeContent, questionsContent);
                    return callGeminiAPI(prompt);
                }
            } catch (Exception e) {
                log.error("Error in Gemini AI question answering for question: {}", question, e);
                return generateFallbackAnswer(question, fields);
            }
        });
    }
    
    public CompletableFuture<String> answerGeneralQuestion(String question) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                String prompt = buildGeneralQuestionPrompt(question);
                return callGeminiAPI(prompt);
            } catch (Exception e) {
                log.error("Error in Gemini AI general question answering for question: {}", question, e);
                return generateFallbackGeneralAnswer(question);
            }
        });
    }
    
    private String callGeminiAPI(String prompt) {
        try {
            // Validate API key
            if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("your_api_key_here") || 
                apiKey.equals("5ed07087a223b82756b8096b5bf72d863bb430ca") || apiKey.equals("disabled")) {
                log.warn("Invalid or test Gemini API key detected. Using fallback responses. Please set a valid API key from https://aistudio.google.com/app/apikey");
                return "AI analysis is temporarily unavailable. Please configure a valid Gemini API key from https://aistudio.google.com/app/apikey to enable intelligent responses.";
            }
            
            String requestBody = buildGeminiRequest(prompt);
            log.debug("Sending request to Gemini API with prompt length: {}", prompt.length());
            
            String response = webClient.post()
                    .uri("/{model}:generateContent?key={apiKey}", modelName, apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            
            if (response != null) {
                JsonNode jsonResponse = objectMapper.readTree(response);
                
                // Check for error in response
                if (jsonResponse.has("error")) {
                    JsonNode error = jsonResponse.get("error");
                    String errorMessage = error.path("message").asText();
                    log.error("Gemini API error: {}", errorMessage);
                    return "AI analysis encountered an error: " + errorMessage;
                }
                
                JsonNode candidates = jsonResponse.path("candidates");
                if (candidates.isArray() && candidates.size() > 0) {
                    JsonNode content = candidates.get(0).path("content");
                    if (content.has("parts") && content.get("parts").isArray() && content.get("parts").size() > 0) {
                        return content.get("parts").get(0).path("text").asText();
                    }
                }
            }
            
            log.warn("Unexpected response format from Gemini API: {}", response);
            return "AI analysis completed but response format was unexpected.";
            
        } catch (org.springframework.web.reactive.function.client.WebClientResponseException e) {
            log.error("Gemini API HTTP error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            
            if (e.getStatusCode().value() == 400) {
                return "AI analysis failed due to invalid request. The content might be too large or contain unsupported characters.";
            } else if (e.getStatusCode().value() == 401) {
                return "AI analysis failed due to authentication issues. Please check your API key.";
            } else if (e.getStatusCode().value() == 403) {
                return "AI analysis failed due to permission issues. Please check your API key permissions.";
            } else if (e.getStatusCode().value() == 429) {
                return "AI analysis failed due to rate limiting. Please try again later.";
            } else {
                return "AI analysis temporarily unavailable due to service issues.";
            }
        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            return "AI analysis encountered an unexpected error.";
        }
    }
    
    private String buildGeminiRequest(String prompt) {
        try {
            // Ensure prompt is not empty and trim it
            String cleanPrompt = prompt != null ? prompt.trim() : "";
            if (cleanPrompt.isEmpty()) {
                cleanPrompt = "Please provide a helpful response.";
            }
            
            // Build the request according to Gemini API specification
            GeminiRequest request = new GeminiRequest(
                new Content[]{
                    new Content(new Part[]{
                        new Part(cleanPrompt)
                    })
                },
                new GenerationConfig(maxTokens, temperature)
            );
            
            String jsonRequest = objectMapper.writeValueAsString(request);
            log.debug("Gemini request JSON: {}", jsonRequest);
            return jsonRequest;
        } catch (Exception e) {
            log.error("Error building Gemini request", e);
            throw new RuntimeException("Failed to build Gemini request", e);
        }
    }
    
    private String buildAnalysisPrompt(String url, String title, String htmlContent, List<PageAnalysisResponse.FieldInfo> fields) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an expert web analyst and UX specialist. Analyze the following webpage and provide insights:\n\n");
        prompt.append("URL: ").append(url).append("\n");
        prompt.append("Title: ").append(title).append("\n");
        prompt.append("Number of form fields: ").append(fields.size()).append("\n\n");
        
        prompt.append("Please provide a comprehensive analysis including:\n");
        prompt.append("1. Page purpose and type (e.g., loan application, registration, e-commerce)\n");
        prompt.append("2. Overall user experience assessment\n");
        prompt.append("3. Form complexity and user journey\n");
        prompt.append("4. Potential improvements or concerns\n");
        prompt.append("5. Accessibility considerations\n\n");
        
        prompt.append("HTML Content (first 2000 characters):\n");
        prompt.append(htmlContent.substring(0, Math.min(htmlContent.length(), 2000))).append("\n\n");
        
        prompt.append("Form Fields Detected:\n");
        for (PageAnalysisResponse.FieldInfo field : fields) {
            prompt.append("- ").append(field.getType()).append(" field: ").append(field.getLabel() != null ? field.getLabel() : field.getName()).append("\n");
        }
        
        prompt.append("\nProvide a professional, helpful analysis that would be useful for developers, UX designers, and business analysts.");
        
        return prompt.toString();
    }
    
    private String buildFieldAnalysisPrompt(String fieldName, String fieldType, String fieldLabel, String placeholder, String context) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are Gemini AI. Explain this form field to the user naturally and conversationally. ");
        prompt.append("Be clear, helpful, and straightforward - just like you normally are. ");
        prompt.append("Don't use any special formatting or numbered lists. ");
        prompt.append("Give a natural, conversational explanation as if you're helping a friend.\n\n");
        
        prompt.append("Field Details:\n");
        prompt.append("- Name: ").append(fieldName != null ? fieldName : "Not specified").append("\n");
        prompt.append("- Type: ").append(fieldType).append("\n");
        prompt.append("- Label: ").append(fieldLabel != null ? fieldLabel : "Not specified").append("\n");
        prompt.append("- Placeholder: ").append(placeholder != null ? placeholder : "Not specified").append("\n");
        prompt.append("- Context: ").append(context).append("\n\n");
        
        prompt.append("Explain what to enter in this field naturally and conversationally. ");
        prompt.append("Include helpful examples and tips. ");
        prompt.append("If it's a choice field, explain the options clearly. ");
        prompt.append("Just give a natural, helpful response like Gemini AI would. ");
        prompt.append("Focus only on explaining the field without adding extra suggestions or disclaimers.");
        
        return prompt.toString();
    }
    
    private String generateFallbackAnalysis(String url, String title, List<PageAnalysisResponse.FieldInfo> fields) {
        StringBuilder analysis = new StringBuilder();
        analysis.append("AI analysis temporarily unavailable. Here's a basic analysis:\n\n");
        analysis.append("This appears to be a ").append(title.toLowerCase().contains("loan") ? "loan application" : "web form").append(" page.\n");
        analysis.append("The page contains ").append(fields.size()).append(" form fields for data collection.\n");
        analysis.append("Based on the field types, this form is designed to gather user information systematically.\n");
        analysis.append("Consider implementing proper validation and clear user guidance for optimal user experience.");
        
        return analysis.toString();
    }
    
    private String generateFallbackFieldExplanation(String fieldName, String fieldType, String fieldLabel, String placeholder) {
        StringBuilder explanation = new StringBuilder();
        
        // Determine what this field is for based on name and label
        String fieldPurpose = determineFieldPurpose(fieldName, fieldLabel, fieldType);
        
        if (fieldPurpose != null) {
            explanation.append(fieldPurpose).append(" ");
        }
        
        // Add contextual explanations based on field type with examples
        switch (fieldType.toLowerCase()) {
            case "email":
                explanation.append("Enter your email address like 'john.smith@gmail.com' or 'sarah@company.com'. ");
                explanation.append("Make sure it's a valid email you can access for confirmations.");
                break;
            case "password":
                explanation.append("Create a secure password with at least 8 characters. ");
                explanation.append("Use a mix of letters, numbers, and symbols like 'MyPass123!'");
                break;
            case "tel":
                explanation.append("Enter your phone number like '(555) 123-4567' or '+1-555-123-4567'. ");
                explanation.append("Include your area code for best results.");
                break;
            case "date":
                explanation.append("Select or enter a date. ");
                explanation.append("Use the format shown or click the calendar icon if available.");
                break;
            case "number":
                explanation.append("Enter numbers only like '25000' or '1500'. ");
                explanation.append("Don't include commas, dollar signs, or other symbols.");
                break;
            case "radio":
                explanation.append("Choose one option from the available choices. ");
                explanation.append("Think about which option best describes your situation.");
                break;
            case "checkbox":
                explanation.append("Check this box if it applies to you or if you agree. ");
                explanation.append("You can usually select multiple checkboxes.");
                break;
            case "select":
                explanation.append("Click to see available options and choose the one that fits best. ");
                explanation.append("Look through all options before deciding.");
                break;
            case "textarea":
                explanation.append("Enter detailed information here. ");
                explanation.append("You can write multiple lines - be specific and clear.");
                break;
            case "text":
            default:
                if (fieldName != null && (fieldName.toLowerCase().contains("name") || 
                    (fieldLabel != null && fieldLabel.toLowerCase().contains("name")))) {
                    explanation.append("Enter your name like 'John Smith' or 'Sarah Johnson'. ");
                    explanation.append("Use your full legal name if this is for official purposes.");
                } else if (fieldName != null && fieldName.toLowerCase().contains("address")) {
                    explanation.append("Enter your address like '123 Main Street' or 'Apt 4B, 456 Oak Avenue'. ");
                    explanation.append("Be as specific as possible for accurate delivery or contact.");
                } else {
                    explanation.append("Enter the requested information clearly. ");
                    if (placeholder != null && !placeholder.isEmpty()) {
                        explanation.append("Follow the example format: '").append(placeholder).append("'");
                    }
                }
        }
        
        return explanation.toString();
    }
    
    private String determineFieldPurpose(String fieldName, String fieldLabel, String fieldType) {
        String name = (fieldName != null ? fieldName : "").toLowerCase();
        String label = (fieldLabel != null ? fieldLabel : "").toLowerCase();
        
        if (name.contains("firstname") || name.contains("first_name") || label.contains("first name")) {
            return "Enter your first name like 'John' or 'Sarah'.";
        } else if (name.contains("lastname") || name.contains("last_name") || label.contains("last name")) {
            return "Enter your last name like 'Smith' or 'Johnson'.";
        } else if (name.contains("income") || label.contains("income")) {
            return "Enter your annual income amount like '75000' (without commas or dollar signs).";
        } else if (name.contains("loan") || label.contains("loan")) {
            if (name.contains("amount") || label.contains("amount")) {
                return "Enter how much money you want to borrow like '25000' or '150000'.";
            } else {
                return "Select what you'll use the loan for.";
            }
        } else if (name.contains("employment") || label.contains("employment") || name.contains("employer")) {
            return "Enter your current employer's name like 'ABC Company' or 'XYZ Corporation'.";
        } else if (name.contains("occupation") || label.contains("occupation")) {
            return "Enter your job title like 'Software Engineer' or 'Marketing Manager'.";
        } else if (name.contains("phone") || label.contains("phone")) {
            return "Enter your phone number including area code.";
        } else if (name.contains("marital") || label.contains("marital")) {
            return "Select your marital status.";
        } else if (name.contains("birth") || label.contains("birth") || name.contains("date")) {
            return "Enter your birth date.";
        }
        
        return null;
    }
    
    private String buildQuestionAnsweringPrompt(String question, String pageContent, List<PageAnalysisResponse.FieldInfo> fields) {
        // Check if the question is already an enhanced prompt from the frontend
        if (question.contains("SCANNED CONTENT") || question.contains("CODING TASK:") || 
            question.contains("EXPLANATION REQUEST:") || question.contains("CODE ANALYSIS:") || 
            question.contains("GENERAL QUESTION:") || question.contains("PROGRAMMING HELP:")) {
            // Use the enhanced prompt directly from frontend
            return question;
        }
        
        // Otherwise, use the standard prompt for simple questions
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are a helpful chatbot assistant analyzing a webpage for a user. ");
        prompt.append("Answer the user's question about this page in a conversational, friendly way.\n\n");
        
        prompt.append("User Question: ").append(question).append("\n\n");
        
        prompt.append("Page Information:\n");
        prompt.append("Content (first 1500 characters): ").append(pageContent.substring(0, Math.min(pageContent.length(), 1500))).append("\n\n");
        
        if (!fields.isEmpty()) {
            prompt.append("Form Fields Available:\n");
            for (PageAnalysisResponse.FieldInfo field : fields) {
                prompt.append("- ").append(field.getType()).append(" field: ")
                      .append(field.getLabel() != null ? field.getLabel() : field.getName())
                      .append(field.getPlaceholder() != null ? " (example: " + field.getPlaceholder() + ")" : "")
                      .append("\n");
            }
            prompt.append("\n");
        }
        
        prompt.append("Instructions:\n");
        prompt.append("1. Answer the question directly and helpfully\n");
        prompt.append("2. If asking about a specific field, explain what to enter with examples\n");
        prompt.append("3. If asking about options, explain each choice clearly\n");
        prompt.append("4. Use a conversational, chatbot-like tone\n");
        prompt.append("5. Be specific and actionable in your response\n");
        prompt.append("6. If the question is about the page purpose, explain what this form/page is for\n\n");
        
        prompt.append("Respond as if you're a helpful assistant guiding the user through this webpage.");
        
        return prompt.toString();
    }
    
    private String buildAdvancedQuestionAnsweringPrompt(String question, String pageContent, List<PageAnalysisResponse.FieldInfo> fields,
                                                        String fullPageContent, String codeContent, String questionsContent) {
        // Check if the question is already an enhanced prompt from the frontend
        if (question.contains("SCANNED CONTENT") || question.contains("CODING TASK:") || 
            question.contains("EXPLANATION REQUEST:") || question.contains("CODE ANALYSIS:") || 
            question.contains("GENERAL QUESTION:") || question.contains("PROGRAMMING HELP:")) {
            // Use the enhanced prompt directly from frontend
            return question;
        }
        
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are Gemini AI. Answer the user's question about the scanned content naturally and conversationally. ");
        prompt.append("Be clear, helpful, and straightforward - just like you normally are. ");
        prompt.append("Don't use any special formatting, bullet points, numbered sections, or technical jargon. ");
        prompt.append("Give a natural, conversational response as if you're explaining something to a friend.\n\n");
        
        prompt.append("USER QUESTION: ").append(question).append("\n\n");
        
        // Limit content size to avoid API limits
        prompt.append("=== SCANNED CONTENT ===\n");
        if (fullPageContent != null && !fullPageContent.trim().isEmpty()) {
            String limitedContent = fullPageContent.length() > 2000 ? 
                fullPageContent.substring(0, 2000) + "..." : fullPageContent;
            prompt.append(limitedContent).append("\n\n");
        }
        
        if (codeContent != null && !codeContent.trim().isEmpty()) {
            prompt.append("=== CODE FOUND ===\n");
            String limitedCode = codeContent.length() > 1000 ? 
                codeContent.substring(0, 1000) + "..." : codeContent;
            prompt.append(limitedCode).append("\n\n");
        }
        
        if (questionsContent != null && !questionsContent.trim().isEmpty()) {
            prompt.append("=== QUESTIONS ON PAGE ===\n");
            String limitedQuestions = questionsContent.length() > 1000 ? 
                questionsContent.substring(0, 1000) + "..." : questionsContent;
            prompt.append(limitedQuestions).append("\n\n");
        }
        
        if (!fields.isEmpty()) {
            prompt.append("=== FORM FIELDS ===\n");
            int fieldCount = 0;
            for (PageAnalysisResponse.FieldInfo field : fields) {
                if (fieldCount >= 10) { // Limit to 10 fields
                    prompt.append("... and ").append(fields.size() - fieldCount).append(" more fields\n");
                    break;
                }
                prompt.append("• ").append(field.getLabel() != null ? field.getLabel() : field.getName())
                      .append(" (").append(field.getType()).append(")");
                if (field.getPlaceholder() != null && !field.getPlaceholder().isEmpty()) {
                    prompt.append(" - Example: ").append(field.getPlaceholder());
                }
                prompt.append("\n");
                fieldCount++;
            }
            prompt.append("\n");
        }
        
        prompt.append("Answer the question naturally and conversationally, just like Gemini AI would. ");
        prompt.append("Be clear, helpful, and straightforward without any special formatting. ");
        prompt.append("Focus only on answering the question directly. Keep it simple and to the point. ");
        prompt.append("Don't include 'common questions' sections or overly detailed explanations. ");
        
        // Special handling for programming questions in scanned content
        String lowerQuestion = question.toLowerCase();
        if (lowerQuestion.contains("program") || lowerQuestion.contains("code") || 
            lowerQuestion.contains("algorithm") || lowerQuestion.contains("implement") ||
            lowerQuestion.contains("how to") || lowerQuestion.contains("solve") ||
            lowerQuestion.contains("example") || lowerQuestion.contains("structure")) {
            
            prompt.append("If this involves programming concepts, provide a structured response with clear explanation, code examples, and step-by-step approach. ");
            prompt.append("Keep it conversational but well-organized for learning.");
        }
        
        // Enhanced handling for technology questions in scanned content
        if (lowerQuestion.contains("mongodb") || lowerQuestion.contains("database") || 
            lowerQuestion.contains("nosql") || lowerQuestion.contains("kafka") ||
            lowerQuestion.contains("redis") || lowerQuestion.contains("aws") ||
            lowerQuestion.contains("api") || lowerQuestion.contains("microservice")) {
            
            prompt.append("If this involves technology concepts, provide comprehensive technical details including core concepts, features, how it works, use cases, advantages, and implementation steps. ");
            prompt.append("Give detailed, developer-focused information.");
        }
        
        return prompt.toString();
    }
    
    private String generateFallbackAnswer(String question, List<PageAnalysisResponse.FieldInfo> fields) {
        StringBuilder answer = new StringBuilder();
        
        String lowerQuestion = question.toLowerCase();
        
        // Check if this is a general question first
        if (isGeneralQuestion(question)) {
            answer.append("I'd be happy to help you with that! ");
            
            if (lowerQuestion.contains("mongodb")) {
                answer.append("MongoDB is a popular NoSQL database that stores data in flexible, JSON-like documents. ");
                answer.append("It's great for applications that need to handle large amounts of data with varying structures. ");
                answer.append("Think of it like a digital filing cabinet where each document can have different fields - perfect for modern web apps!");
            } else if (lowerQuestion.contains("database")) {
                answer.append("A database is like a digital storage system for your information. ");
                answer.append("It's organized, searchable, and keeps your data safe and accessible. ");
                answer.append("Think of it like a super-powered spreadsheet that can handle millions of records!");
            } else if (lowerQuestion.contains("what is") || lowerQuestion.contains("explain")) {
                answer.append("I'd love to explain that concept to you! ");
                answer.append("However, I'm currently experiencing some technical difficulties with my AI analysis. ");
                answer.append("Could you try asking your question again in a moment? I should be back to full capacity soon!");
            } else {
                answer.append("That's a great question! ");
                answer.append("I'm currently having some technical difficulties, but I'd be happy to help you with that. ");
                answer.append("Please try asking again in a moment!");
            }
        } else {
            // Page-specific questions - make them more conversational
            answer.append("I'd be happy to help you with that! ");
            
            if (lowerQuestion.contains("what") && (lowerQuestion.contains("field") || lowerQuestion.contains("enter"))) {
                answer.append("This page has ").append(fields.size()).append(" form fields for you to fill out. ");
                answer.append("Each field is designed to collect specific information from you. ");
                answer.append("Look for the field labels and any placeholder text - they'll give you guidance on what to enter.");
            } else if (lowerQuestion.contains("how") && lowerQuestion.contains("fill")) {
                answer.append("Filling out this form is straightforward! Start from the top and work your way down. ");
                answer.append("Read each field label carefully and enter the requested information in the format shown. ");
                answer.append("Required fields (usually marked with *) must be completed. ");
                answer.append("Just take your time and double-check your entries before submitting.");
            } else if (lowerQuestion.contains("purpose") || lowerQuestion.contains("for")) {
                answer.append("This appears to be a form for collecting information. ");
                answer.append("Based on the fields present, it's designed to gather your details systematically.");
            } else if (lowerQuestion.contains("flow") || lowerQuestion.contains("process")) {
                answer.append("Based on what I can see on this page, there's a clear flow of information being collected. ");
                answer.append("The form is designed to gather data step by step, making it easy for you to provide what's needed.");
            } else {
                answer.append("Based on the page content, I can see there are various form fields available. ");
                answer.append("Could you be more specific about which field or aspect you'd like help with?");
            }
        }
        
        return answer.toString();
    }
    
    private boolean isGeneralQuestion(String question) {
        String lowerQuestion = question.toLowerCase();
        
        // List of general topics that don't require page context
        String[] generalTopics = {
            "what is", "explain", "define", "describe", "how does", "tell me about",
            "mongodb", "database", "sql", "nosql", "javascript", "python", "java",
            "html", "css", "react", "node.js", "spring", "docker", "kubernetes",
            "aws", "azure", "cloud", "api", "rest", "graphql", "microservices",
            "machine learning", "ai", "artificial intelligence", "data science",
            "cybersecurity", "networking", "devops", "agile", "scrum"
        };
        
        // Check if the question contains general topics
        for (String topic : generalTopics) {
            if (lowerQuestion.contains(topic)) {
                return true;
            }
        }
        
        // Check if it's a conceptual question (doesn't ask about specific page elements)
        if (lowerQuestion.contains("what is") || 
            lowerQuestion.contains("explain") || 
            lowerQuestion.contains("define") || 
            lowerQuestion.contains("how does") ||
            lowerQuestion.contains("tell me about")) {
            return true;
        }
        
        return false;
    }
    
    private String buildGeneralQuestionPrompt(String question) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are Gemini AI. Answer the user's question naturally and conversationally, just like you normally do. ");
        prompt.append("Be clear, helpful, and straightforward. ");
        prompt.append("Keep your response concise and focused. ");
        prompt.append("Don't use any special formatting, bullet points, numbered sections, or technical jargon. ");
        prompt.append("Don't suggest additional questions, add disclaimers, or include 'common questions' sections. ");
        prompt.append("Just give a natural, conversational response as if you're talking to a friend.\n\n");
        
        // For programming and technical questions, let the AI provide structured responses naturally
        String lowerQuestion = question.toLowerCase();
        if (lowerQuestion.contains("program") || lowerQuestion.contains("code") || 
            lowerQuestion.contains("algorithm") || lowerQuestion.contains("java") || 
            lowerQuestion.contains("python") || lowerQuestion.contains("javascript") ||
            lowerQuestion.contains("how to") || lowerQuestion.contains("implement") ||
            lowerQuestion.contains("solve") || lowerQuestion.contains("example") ||
            lowerQuestion.contains("array") || lowerQuestion.contains("data structure") ||
            lowerQuestion.contains("mongodb") || lowerQuestion.contains("database")) {
            
            prompt.append("This appears to be a programming or technical question. ");
            prompt.append("Provide a clear, structured response that's helpful for developers. ");
            prompt.append("Include code examples if relevant, and explain concepts clearly. ");
            prompt.append("Answer the question directly without referencing any scanned content. ");
            prompt.append("Give a comprehensive explanation of the programming concept being asked about.\n\n");
        }
        
        prompt.append("USER QUESTION: ").append(question).append("\n\n");
        
        prompt.append("Respond naturally like Gemini AI would - clear, helpful, and conversational. ");
        prompt.append("Focus only on answering the question directly. Keep it simple and to the point. ");
        prompt.append("If this is a general programming question, explain the concept directly without referencing any scanned content or specific problems.");
        
        return prompt.toString();
    }
    
    private String generateFallbackGeneralAnswer(String question) {
        StringBuilder answer = new StringBuilder();
        
        String lowerQuestion = question.toLowerCase();
        
        if (lowerQuestion.contains("mongodb")) {
            answer.append("MongoDB is a popular NoSQL database that stores data in flexible, JSON-like documents. ");
            answer.append("It's great for applications that need to handle large amounts of data with varying structures. ");
            answer.append("Think of it like a digital filing cabinet where each document can have different fields - perfect for modern web apps!");
        } else if (lowerQuestion.contains("database")) {
            answer.append("A database is like a digital storage system for your information. ");
            answer.append("It's organized, searchable, and keeps your data safe and accessible. ");
            answer.append("Think of it like a super-powered spreadsheet that can handle millions of records!");
        } else if (lowerQuestion.contains("what is") || lowerQuestion.contains("explain")) {
            answer.append("I'd love to explain that concept to you! ");
            answer.append("However, I'm currently experiencing some technical difficulties with my AI analysis. ");
            answer.append("Could you try asking your question again in a moment? I should be back to full capacity soon!");
        } else {
            answer.append("That's a great question! ");
            answer.append("I'm currently having some technical difficulties, but I'd be happy to help you with that. ");
            answer.append("Please try asking again in a moment!");
        }
        
        return answer.toString();
    }
    
    // Request/Response classes for Gemini API
    private static class GeminiRequest {
        public Content[] contents;
        public GenerationConfig generationConfig;
        
        public GeminiRequest(Content[] contents, GenerationConfig generationConfig) {
            this.contents = contents;
            this.generationConfig = generationConfig;
        }
    }
    
    private static class Content {
        public Part[] parts;
        
        public Content(Part[] parts) {
            this.parts = parts;
        }
    }
    
    private static class Part {
        public String text;
        
        public Part(String text) {
            this.text = text != null ? text : "";
        }
    }
    
    private static class GenerationConfig {
        public int maxOutputTokens;
        public double temperature;
        
        public GenerationConfig(int maxOutputTokens, double temperature) {
            this.maxOutputTokens = maxOutputTokens;
            this.temperature = temperature;
        }
    }
}
