package com.aiscanner.controller;

import com.aiscanner.dto.PageAnalysisRequest;
import com.aiscanner.dto.PageAnalysisResponse;
import com.aiscanner.dto.ChatRequest;
import com.aiscanner.dto.ChatResponse;
import com.aiscanner.service.ScannerService;
import com.aiscanner.service.GeminiAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/scanner")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class ScannerController {
    
    @Autowired
    private ScannerService scannerService;
    
    @Autowired
    private GeminiAIService geminiAIService;
    
    @PostMapping("/analyze")
    public ResponseEntity<PageAnalysisResponse> analyzePage(@RequestBody PageAnalysisRequest request) {
        try {
            PageAnalysisResponse response = scannerService.analyzePage(request.getUrl());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                PageAnalysisResponse.builder()
                    .error("Failed to analyze page: " + e.getMessage())
                    .build()
            );
        }
    }
    
    @GetMapping("/demo-form/{url}")
    public ResponseEntity<String> getDemoForm(@PathVariable String url) {
        try {
            // Decode the URL parameter
            String decodedUrl = java.net.URLDecoder.decode(url, "UTF-8");
            PageAnalysisResponse response = scannerService.analyzePage(decodedUrl);
            
            if (response.getDemoForm() != null) {
                return ResponseEntity.ok()
                    .header("Content-Type", "text/html")
                    .body(response.getDemoForm());
            } else {
                return ResponseEntity.ok("Demo form not available for this URL.");
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to generate demo form: " + e.getMessage());
        }
    }
    
    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chatAboutPage(@RequestBody ChatRequest request) {
        try {
            if (request.getQuestion() == null || request.getQuestion().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    ChatResponse.builder()
                        .error("Question cannot be empty")
                        .timestamp(System.currentTimeMillis())
                        .build()
                );
            }
            
            // First get the page analysis if URL is provided
            PageAnalysisResponse pageAnalysis = null;
            if (request.getUrl() != null && !request.getUrl().trim().isEmpty()) {
                pageAnalysis = scannerService.analyzePage(request.getUrl());
            }
            
            // Answer the question using AI with comprehensive content
            String pageContent = request.getPageContent() != null ? request.getPageContent() : "";
            if (pageAnalysis != null && pageAnalysis.getPageSummary() != null) {
                pageContent = pageAnalysis.getPageSummary();
            }
            
            String answer = geminiAIService.answerQuestionAboutPage(
                request.getQuestion(),
                pageContent,
                pageAnalysis != null ? pageAnalysis.getFields() : java.util.Collections.emptyList(),
                pageAnalysis != null ? pageAnalysis.getPageContent() : "",
                pageAnalysis != null ? pageAnalysis.getCodeContent() : "",
                pageAnalysis != null ? pageAnalysis.getQuestionsContent() : ""
            ).get();
            
            return ResponseEntity.ok(
                ChatResponse.builder()
                    .answer(answer)
                    .question(request.getQuestion())
                    .url(request.getUrl())
                    .timestamp(System.currentTimeMillis())
                    .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ChatResponse.builder()
                    .error("Failed to answer question: " + e.getMessage())
                    .question(request.getQuestion())
                    .timestamp(System.currentTimeMillis())
                    .build()
            );
        }
    }
    
    @PostMapping("/ask")
    public ResponseEntity<ChatResponse> askGeneralQuestion(@RequestBody ChatRequest request) {
        try {
            if (request.getQuestion() == null || request.getQuestion().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(
                    ChatResponse.builder()
                        .error("Question cannot be empty")
                        .timestamp(System.currentTimeMillis())
                        .build()
                );
            }
            
            // For general questions, use the dedicated general question method
            String answer = geminiAIService.answerGeneralQuestion(request.getQuestion()).get();
            
            return ResponseEntity.ok(
                ChatResponse.builder()
                    .answer(answer)
                    .question(request.getQuestion())
                    .url(null) // No URL for general questions
                    .timestamp(System.currentTimeMillis())
                    .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                ChatResponse.builder()
                    .error("Failed to answer question: " + e.getMessage())
                    .question(request.getQuestion())
                    .timestamp(System.currentTimeMillis())
                    .build()
            );
        }
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("AI Scanner Pro Backend is running with Gemini AI!");
    }
    
    @GetMapping("/test-gemini")
    public ResponseEntity<String> testGemini() {
        try {
            String testResult = geminiAIService.answerQuestionAboutPage(
                "Hello, this is a test", 
                "Test content", 
                java.util.Collections.emptyList(),
                "",
                "",
                ""
            ).get();
            return ResponseEntity.ok("Gemini AI test successful: " + testResult);
        } catch (Exception e) {
            return ResponseEntity.ok("Gemini AI test failed: " + e.getMessage());
        }
    }
}
