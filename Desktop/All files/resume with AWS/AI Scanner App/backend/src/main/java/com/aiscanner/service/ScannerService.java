package com.aiscanner.service;

import com.aiscanner.dto.PageAnalysisResponse;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@Service
@Slf4j
public class ScannerService {
    
    @Autowired
    private GeminiAIService geminiAIService;
    
    @Autowired
    private DemoFormGeneratorService demoFormGeneratorService;
    
    @Value("${scraper.user.agent}")
    private String userAgent;
    
    @Value("${scraper.timeout:15000}")
    private int timeout;
    
    @Value("${scraper.max.retries:3}")
    private int maxRetries;
    
    public PageAnalysisResponse analyzePage(String url) throws IOException {
        Document doc = null;
        int retryCount = 0;
        
        // Retry logic for web scraping
        while (retryCount < maxRetries) {
            try {
                doc = Jsoup.connect(url)
                        .userAgent(userAgent)
                        .timeout(timeout)
                        .followRedirects(true)
                        .ignoreHttpErrors(true)
                        .get();
                break;
            } catch (IOException e) {
                retryCount++;
                log.warn("Attempt {} failed for URL: {}. Error: {}", retryCount, url, e.getMessage());
                if (retryCount >= maxRetries) {
                    throw e;
                }
                try {
                    Thread.sleep(1000 * retryCount); // Exponential backoff
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new IOException("Scraping interrupted", ie);
                }
            }
        }
        
        if (doc == null) {
            throw new IOException("Failed to retrieve page after " + maxRetries + " attempts");
        }
        
        String title = doc.title();
        List<PageAnalysisResponse.FieldInfo> fields = extractFields(doc);
        String htmlContent = doc.html();
        
        // Extract comprehensive page content for better AI analysis
        String pageContent = extractPageContent(doc);
        String codeContent = extractCodeContent(doc);
        String questionsContent = extractQuestionsContent(doc);
        
        // Use Gemini AI for intelligent analysis
        CompletableFuture<String> aiAnalysis = geminiAIService.analyzePageWithAI(url, title, htmlContent, fields);
        
        // Process fields with AI explanations
        List<PageAnalysisResponse.FieldInfo> enhancedFields = enhanceFieldsWithAI(fields, doc);
        
        try {
            String pageSummary = aiAnalysis.get();
            
            // Generate demo form based on the analysis
            String demoForm = demoFormGeneratorService.generateDummyForm(
                PageAnalysisResponse.builder()
                    .url(url)
                    .title(title)
                    .fields(enhancedFields)
                    .pageSummary(pageSummary)
                    .build()
            );
            
            return PageAnalysisResponse.builder()
                    .url(url)
                    .title(title)
                    .fields(enhancedFields)
                    .pageSummary(pageSummary)
                    .demoForm(demoForm)
                    .pageContent(pageContent)
                    .codeContent(codeContent)
                    .questionsContent(questionsContent)
                    .build();
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error getting AI analysis for URL: {}", url, e);
            Thread.currentThread().interrupt();
            String fallbackSummary = generateFallbackPageSummary(doc, enhancedFields);
            
            // Generate demo form even with fallback analysis
            String demoForm = demoFormGeneratorService.generateDummyForm(
                PageAnalysisResponse.builder()
                    .url(url)
                    .title(title)
                    .fields(enhancedFields)
                    .pageSummary(fallbackSummary)
                    .build()
            );
            
            return PageAnalysisResponse.builder()
                    .url(url)
                    .title(title)
                    .fields(enhancedFields)
                    .pageSummary(fallbackSummary)
                    .demoForm(demoForm)
                    .pageContent(pageContent)
                    .codeContent(codeContent)
                    .questionsContent(questionsContent)
                    .build();
        }
    }
    
    private List<PageAnalysisResponse.FieldInfo> extractFields(Document doc) {
        List<PageAnalysisResponse.FieldInfo> fields = new ArrayList<>();
        
        // Extract form inputs with enhanced detection
        Elements inputs = doc.select("input, select, textarea, button[type=submit]");
        for (Element input : inputs) {
            String name = input.attr("name");
            String type = input.attr("type");
            String placeholder = input.attr("placeholder");
            String id = input.attr("id");
            boolean required = input.hasAttr("required");
            String value = input.attr("value");
            
            // Skip submit buttons and hidden fields for analysis
            if ("submit".equals(type) || "hidden".equals(type)) {
                continue;
            }
            
            // Find associated label with multiple strategies
            String label = findLabel(input);
            
            // Get field context for better AI analysis
            String context = getFieldContext(input, doc);
            
            fields.add(PageAnalysisResponse.FieldInfo.builder()
                    .name(name.isEmpty() ? id : name)
                    .label(label)
                    .type(type.isEmpty() ? input.tagName() : type)
                    .placeholder(placeholder)
                    .required(required)
                    .aiExplanation("Analyzing with AI...") // Will be updated by AI service
                    .build());
        }
        
        return fields;
    }
    
    private List<PageAnalysisResponse.FieldInfo> enhanceFieldsWithAI(List<PageAnalysisResponse.FieldInfo> fields, Document doc) {
        List<CompletableFuture<PageAnalysisResponse.FieldInfo>> enhancedFields = new ArrayList<>();
        
        for (PageAnalysisResponse.FieldInfo field : fields) {
            CompletableFuture<PageAnalysisResponse.FieldInfo> enhancedField = geminiAIService
                    .analyzeFieldWithAI(field.getName(), field.getType(), field.getLabel(), field.getPlaceholder(), getFieldContext(field, doc))
                    .thenApply(aiExplanation -> {
                        return PageAnalysisResponse.FieldInfo.builder()
                                .name(field.getName())
                                .label(field.getLabel())
                                .type(field.getType())
                                .placeholder(field.getPlaceholder())
                                .required(field.isRequired())
                                .aiExplanation(aiExplanation)
                                .build();
                    });
            
            enhancedFields.add(enhancedField);
        }
        
        // Wait for all AI analyses to complete
        CompletableFuture<Void> allFields = CompletableFuture.allOf(
                enhancedFields.toArray(new CompletableFuture[0])
        );
        
        try {
            allFields.get(); // Wait for completion
            
            List<PageAnalysisResponse.FieldInfo> result = new ArrayList<>();
            for (CompletableFuture<PageAnalysisResponse.FieldInfo> future : enhancedFields) {
                result.add(future.get());
            }
            return result;
            
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error enhancing fields with AI", e);
            Thread.currentThread().interrupt();
            return fields; // Return original fields if AI enhancement fails
        }
    }
    
    private String findLabel(Element input) {
        // Strategy 1: Find label by for attribute
        String id = input.attr("id");
        if (!id.isEmpty()) {
            Element label = input.parent().selectFirst("label[for=" + id + "]");
            if (label != null) {
                return label.text().trim();
            }
        }
        
        // Strategy 2: Find label as parent
        Element parentLabel = input.parent().selectFirst("label");
        if (parentLabel != null) {
            return parentLabel.text().trim();
        }
        
        // Strategy 3: Find label as sibling
        Element siblingLabel = input.parent().selectFirst("label");
        if (siblingLabel != null) {
            return siblingLabel.text().trim();
        }
        
        // Strategy 4: Find label in nearby text
        Element nearbyText = input.parent().selectFirst("span, div, p");
        if (nearbyText != null && !nearbyText.text().trim().isEmpty()) {
            return nearbyText.text().trim();
        }
        
        // Strategy 5: Use placeholder or name as fallback
        String placeholder = input.attr("placeholder");
        if (!placeholder.isEmpty()) {
            return placeholder;
        }
        
        String name = input.attr("name");
        if (!name.isEmpty()) {
            return name.replaceAll("[_-]", " ").trim();
        }
        
        return "Unnamed Field";
    }
    
    private String getFieldContext(PageAnalysisResponse.FieldInfo field, Document doc) {
        // Get surrounding context for better AI analysis
        StringBuilder context = new StringBuilder();
        
        // Find the field in the document
        Elements fieldElements = doc.select(String.format("[name='%s'], [id='%s']", field.getName(), field.getName()));
        if (!fieldElements.isEmpty()) {
            Element fieldElement = fieldElements.first();
            context.append("Field context: ");
            
            // Get parent form context
            Element form = fieldElement.closest("form");
            if (form != null) {
                context.append("Located in form. ");
                String formAction = form.attr("action");
                if (!formAction.isEmpty()) {
                    context.append("Form action: ").append(formAction).append(". ");
                }
            }
            
            // Get nearby text context
            Element parent = fieldElement.parent();
            if (parent != null) {
                String parentText = parent.text().trim();
                if (parentText.length() > 0 && parentText.length() < 200) {
                    context.append("Nearby text: ").append(parentText).append(". ");
                }
            }
        }
        
        return context.toString();
    }
    
    private String getFieldContext(Element input, Document doc) {
        StringBuilder context = new StringBuilder();
        
        // Get parent form context
        Element form = input.closest("form");
        if (form != null) {
            context.append("Located in form. ");
            String formAction = form.attr("action");
            if (!formAction.isEmpty()) {
                context.append("Form action: ").append(formAction).append(". ");
            }
        }
        
        // Get nearby text context
        Element parent = input.parent();
        if (parent != null) {
            String parentText = parent.text().trim();
            if (parentText.length() > 0 && parentText.length() < 200) {
                context.append("Nearby text: ").append(parentText).append(". ");
            }
        }
        
        return context.toString();
    }
    
    private String generateFallbackPageSummary(Document doc, List<PageAnalysisResponse.FieldInfo> fields) {
        StringBuilder summary = new StringBuilder();
        
        summary.append("This page contains ").append(fields.size()).append(" form fields. ");
        
        // Analyze page type based on content
        String title = doc.title().toLowerCase();
        String bodyText = doc.body().text().toLowerCase();
        
        if (title.contains("loan") || bodyText.contains("loan")) {
            summary.append("This appears to be a loan application form. ");
        } else if (title.contains("register") || bodyText.contains("register")) {
            summary.append("This appears to be a registration form. ");
        } else if (title.contains("contact") || bodyText.contains("contact")) {
            summary.append("This appears to be a contact form. ");
        } else if (title.contains("checkout") || bodyText.contains("checkout")) {
            summary.append("This appears to be a checkout form. ");
        } else {
            summary.append("This appears to be a data collection form. ");
        }
        
        // Count field types
        long textFields = fields.stream().filter(f -> "text".equals(f.getType())).count();
        long emailFields = fields.stream().filter(f -> "email".equals(f.getType())).count();
        long passwordFields = fields.stream().filter(f -> "password".equals(f.getType())).count();
        
        if (textFields > 0) summary.append("Contains ").append(textFields).append(" text input fields. ");
        if (emailFields > 0) summary.append("Contains ").append(emailFields).append(" email fields. ");
        if (passwordFields > 0) summary.append("Contains ").append(passwordFields).append(" password fields. ");
        
        summary.append("The form is designed to collect user information systematically.");
        
        return summary.toString();
    }
    
    private String extractPageContent(Document doc) {
        StringBuilder content = new StringBuilder();
        
        // Extract main text content
        String bodyText = doc.body().text();
        content.append("Page Text Content:\n").append(bodyText).append("\n\n");
        
        // Extract headings structure
        Elements headings = doc.select("h1, h2, h3, h4, h5, h6");
        if (!headings.isEmpty()) {
            content.append("Page Structure (Headings):\n");
            for (Element heading : headings) {
                content.append("- ").append(heading.tagName().toUpperCase()).append(": ").append(heading.text()).append("\n");
            }
            content.append("\n");
        }
        
        // Extract lists and important content
        Elements lists = doc.select("ul, ol");
        if (!lists.isEmpty()) {
            content.append("Lists Found:\n");
            for (Element list : lists) {
                Elements items = list.select("li");
                for (Element item : items) {
                    content.append("• ").append(item.text()).append("\n");
                }
            }
            content.append("\n");
        }
        
        // Extract paragraphs
        Elements paragraphs = doc.select("p");
        if (!paragraphs.isEmpty()) {
            content.append("Main Content Paragraphs:\n");
            for (Element p : paragraphs) {
                String text = p.text().trim();
                if (text.length() > 20) { // Only include substantial paragraphs
                    content.append("- ").append(text).append("\n");
                }
            }
        }
        
        return content.toString();
    }
    
    private String extractCodeContent(Document doc) {
        StringBuilder codeContent = new StringBuilder();
        
        // Extract code blocks
        Elements codeBlocks = doc.select("code, pre, .code, .highlight, script[type='text/javascript']");
        if (!codeBlocks.isEmpty()) {
            codeContent.append("Code Content Found:\n");
            for (Element code : codeBlocks) {
                String codeText = code.text().trim();
                if (codeText.length() > 10) {
                    codeContent.append("Code Block:\n```\n").append(codeText).append("\n```\n\n");
                }
            }
        }
        
        // Extract programming-related content
        Elements programmingElements = doc.select("[class*='java'], [class*='code'], [class*='program'], pre");
        for (Element element : programmingElements) {
            String text = element.text().trim();
            if (text.contains("public") || text.contains("class") || text.contains("function") || 
                text.contains("for") || text.contains("if") || text.contains("while")) {
                codeContent.append("Programming Content:\n").append(text).append("\n\n");
            }
        }
        
        return codeContent.toString();
    }
    
    private String extractQuestionsContent(Document doc) {
        StringBuilder questions = new StringBuilder();
        
        // Look for question patterns in text
        String pageText = doc.body().text();
        String[] sentences = pageText.split("[.!?]");
        
        questions.append("Questions/Prompts Found:\n");
        for (String sentence : sentences) {
            sentence = sentence.trim();
            if (sentence.contains("?") || 
                sentence.toLowerCase().startsWith("what") ||
                sentence.toLowerCase().startsWith("how") ||
                sentence.toLowerCase().startsWith("why") ||
                sentence.toLowerCase().startsWith("when") ||
                sentence.toLowerCase().startsWith("where") ||
                sentence.toLowerCase().contains("answer") ||
                sentence.toLowerCase().contains("question")) {
                questions.append("Q: ").append(sentence).append("\n");
            }
        }
        
        // Extract form labels as questions
        Elements labels = doc.select("label");
        if (!labels.isEmpty()) {
            questions.append("\nForm Questions/Labels:\n");
            for (Element label : labels) {
                String labelText = label.text().trim();
                if (!labelText.isEmpty()) {
                    questions.append("- ").append(labelText).append("\n");
                }
            }
        }
        
        return questions.toString();
    }
}
