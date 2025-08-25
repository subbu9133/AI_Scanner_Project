package com.aiscanner.service;

import com.aiscanner.dto.PageAnalysisResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
@Slf4j
public class DemoFormGeneratorService {
    
    private final Random random = new Random();
    
    public String generateDummyForm(PageAnalysisResponse analysis) {
        StringBuilder html = new StringBuilder();
        
        // Generate HTML header
        html.append("<!DOCTYPE html>\n");
        html.append("<html lang=\"en\">\n");
        html.append("<head>\n");
        html.append("    <meta charset=\"UTF-8\">\n");
        html.append("    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n");
        html.append("    <title>Demo Form - ").append(analysis.getTitle()).append("</title>\n");
        html.append("    <style>\n");
        html.append("        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }\n");
        html.append("        .form-container { background: #f9f9f9; padding: 30px; border-radius: 10px; margin: 20px 0; }\n");
        html.append("        .form-group { margin-bottom: 20px; }\n");
        html.append("        label { display: block; margin-bottom: 5px; font-weight: bold; color: #333; }\n");
        html.append("        input, select, textarea { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 5px; font-size: 16px; }\n");
        html.append("        .required { color: red; }\n");
        html.append("        .field-info { background: #e8f4fd; padding: 10px; border-radius: 5px; margin-top: 5px; font-size: 14px; color: #0066cc; }\n");
        html.append("        .submit-btn { background: #007bff; color: white; padding: 12px 30px; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; }\n");
        html.append("        .submit-btn:hover { background: #0056b3; }\n");
        html.append("        .form-header { text-align: center; margin-bottom: 30px; }\n");
        html.append("        .form-header h1 { color: #333; margin-bottom: 10px; }\n");
        html.append("        .form-header p { color: #666; }\n");
        html.append("    </style>\n");
        html.append("</head>\n");
        html.append("<body>\n");
        
        // Form header
        html.append("    <div class=\"form-header\">\n");
        html.append("        <h1>📋 Demo Form Generated from Analysis</h1>\n");
        html.append("        <p><strong>Original URL:</strong> ").append(analysis.getUrl()).append("</p>\n");
        html.append("        <p><strong>Form Type:</strong> ").append(determineFormType(analysis)).append("</p>\n");
        html.append("        <p><strong>Total Fields:</strong> ").append(analysis.getFields().size()).append("</p>\n");
        html.append("    </div>\n");
        
        // Start form
        html.append("    <div class=\"form-container\">\n");
        html.append("        <form id=\"demoForm\">\n");
        
        // Generate form fields based on analysis
        if (analysis.getFields() != null && !analysis.getFields().isEmpty()) {
            for (PageAnalysisResponse.FieldInfo field : analysis.getFields()) {
                html.append(generateFormField(field));
            }
        } else {
            // Generate default fields if none detected
            html.append(generateDefaultFields());
        }
        
        // Submit button
        html.append("            <div class=\"form-group\">\n");
        html.append("                <button type=\"submit\" class=\"submit-btn\">🚀 Submit Demo Form</button>\n");
        html.append("            </div>\n");
        html.append("        </form>\n");
        html.append("    </div>\n");
        
        // Add JavaScript for form handling
        html.append("    <script>\n");
        html.append("        document.getElementById('demoForm').addEventListener('submit', function(e) {\n");
        html.append("            e.preventDefault();\n");
        html.append("            alert('🎉 Demo form submitted! This is a demonstration form generated from AI analysis.');\n");
        html.append("        });\n");
        html.append("    </script>\n");
        html.append("</body>\n");
        html.append("</html>");
        
        return html.toString();
    }
    
    private String generateFormField(PageAnalysisResponse.FieldInfo field) {
        StringBuilder fieldHtml = new StringBuilder();
        
        fieldHtml.append("            <div class=\"form-group\">\n");
        
        // Generate label
        String labelText = field.getLabel() != null ? field.getLabel() : field.getName();
        if (labelText == null || labelText.isEmpty()) {
            labelText = "Field " + field.getName();
        }
        
        fieldHtml.append("                <label for=\"").append(field.getName()).append("\">");
        fieldHtml.append(labelText);
        if (field.isRequired()) {
            fieldHtml.append(" <span class=\"required\">*</span>");
        }
        fieldHtml.append("</label>\n");
        
        // Generate input field
        fieldHtml.append("                ");
        fieldHtml.append(generateInputElement(field, labelText));
        fieldHtml.append("\n");
        
        // Add field information
        fieldHtml.append("                <div class=\"field-info\">\n");
        fieldHtml.append("                    <strong>AI Analysis:</strong> ").append(field.getAiExplanation()).append("\n");
        fieldHtml.append("                </div>\n");
        
        fieldHtml.append("            </div>\n");
        
        return fieldHtml.toString();
    }
    
    private String generateInputElement(PageAnalysisResponse.FieldInfo field, String labelText) {
        String type = field.getType() != null ? field.getType().toLowerCase() : "text";
        String name = field.getName() != null ? field.getName() : "field_" + System.currentTimeMillis();
        String placeholder = field.getPlaceholder() != null ? field.getPlaceholder() : "";
        
        switch (type) {
            case "email":
                return String.format("<input type=\"email\" id=\"%s\" name=\"%s\" placeholder=\"%s\" %s>", 
                    name, name, placeholder, field.isRequired() ? "required" : "");
                
            case "password":
                return String.format("<input type=\"password\" id=\"%s\" name=\"%s\" placeholder=\"%s\" %s>", 
                    name, name, placeholder, field.isRequired() ? "required" : "");
                
            case "tel":
            case "phone":
                return String.format("<input type=\"tel\" id=\"%s\" name=\"%s\" placeholder=\"%s\" %s>", 
                    name, name, placeholder, field.isRequired() ? "required" : "");
                
            case "date":
                return String.format("<input type=\"date\" id=\"%s\" name=\"%s\" %s>", 
                    name, name, field.isRequired() ? "required" : "");
                
            case "number":
                return String.format("<input type=\"number\" id=\"%s\" name=\"%s\" placeholder=\"%s\" %s>", 
                    name, name, placeholder, field.isRequired() ? "required" : "");
                
            case "select":
                return generateSelectElement(name, field);
                
            case "textarea":
                return String.format("<textarea id=\"%s\" name=\"%s\" rows=\"4\" placeholder=\"%s\" %s></textarea>", 
                    name, name, placeholder, field.isRequired() ? "required" : "");
                
            case "checkbox":
                return String.format("<input type=\"checkbox\" id=\"%s\" name=\"%s\" %s> <label for=\"%s\">%s</label>", 
                    name, name, field.isRequired() ? "required" : "", name, labelText);
                
            case "radio":
                return generateRadioElements(name, field, labelText);
                
            default:
                return String.format("<input type=\"text\" id=\"%s\" name=\"%s\" placeholder=\"%s\" %s>", 
                    name, name, placeholder, field.isRequired() ? "required" : "");
        }
    }
    
    private String generateSelectElement(String name, PageAnalysisResponse.FieldInfo field) {
        StringBuilder select = new StringBuilder();
        select.append("<select id=\"").append(name).append("\" name=\"").append(name).append("\"");
        if (field.isRequired()) {
            select.append(" required");
        }
        select.append(">\n");
        select.append("                    <option value=\"\">-- Select an option --</option>\n");
        
        // Generate relevant options based on field type
        String[] options = generateOptionsForField(field);
        for (String option : options) {
            select.append("                    <option value=\"").append(option.toLowerCase().replace(" ", "_")).append("\">").append(option).append("</option>\n");
        }
        
        select.append("                </select>");
        return select.toString();
    }
    
    private String generateRadioElements(String name, PageAnalysisResponse.FieldInfo field, String labelText) {
        StringBuilder radio = new StringBuilder();
        String[] options = generateOptionsForField(field);
        
        for (int i = 0; i < options.length; i++) {
            String option = options[i];
            String value = option.toLowerCase().replace(" ", "_");
            radio.append(String.format("<input type=\"radio\" id=\"%s_%d\" name=\"%s\" value=\"%s\" %s>", 
                name, i, name, value, i == 0 && field.isRequired() ? "required" : ""));
            radio.append(String.format("<label for=\"%s_%d\">%s</label><br>", name, i, option));
        }
        
        return radio.toString();
    }
    
    private String[] generateOptionsForField(PageAnalysisResponse.FieldInfo field) {
        String label = field.getLabel() != null ? field.getLabel().toLowerCase() : "";
        String name = field.getName() != null ? field.getName().toLowerCase() : "";
        
        if (label.contains("gender") || name.contains("gender")) {
            return new String[]{"Male", "Female", "Other", "Prefer not to say"};
        } else if (label.contains("country") || name.contains("country")) {
            return new String[]{"United States", "Canada", "United Kingdom", "Australia", "Germany", "France", "India", "Japan"};
        } else if (label.contains("state") || name.contains("state")) {
            return new String[]{"California", "New York", "Texas", "Florida", "Illinois", "Pennsylvania", "Ohio", "Georgia"};
        } else if (label.contains("marital") || name.contains("marital")) {
            return new String[]{"Single", "Married", "Divorced", "Widowed", "Separated"};
        } else if (label.contains("education") || name.contains("education")) {
            return new String[]{"High School", "Associate's Degree", "Bachelor's Degree", "Master's Degree", "Doctorate"};
        } else if (label.contains("income") || name.contains("income")) {
            return new String[]{"Under $25,000", "$25,000 - $50,000", "$50,000 - $75,000", "$75,000 - $100,000", "Over $100,000"};
        } else {
            return new String[]{"Option 1", "Option 2", "Option 3", "Option 4"};
        }
    }
    
    private String generateDefaultFields() {
        return """
                <div class="form-group">
                    <label for="fullName">Full Name <span class="required">*</span></label>
                    <input type="text" id="fullName" name="fullName" placeholder="Enter your full name" required>
                    <div class="field-info">
                        <strong>AI Analysis:</strong> This field expects the user's complete legal name as it appears on official documents.
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="email">Email Address <span class="required">*</span></label>
                    <input type="email" id="email" name="email" placeholder="your.email@example.com" required>
                    <div class="field-info">
                        <strong>AI Analysis:</strong> This field expects a valid email address format for communication purposes.
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" id="phone" name="phone" placeholder="(555) 123-4567">
                    <div class="field-info">
                        <strong>AI Analysis:</strong> This field expects a phone number format for contact purposes.
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="message">Message</label>
                    <textarea id="message" name="message" rows="4" placeholder="Enter your message here"></textarea>
                    <div class="field-info">
                        <strong>AI Analysis:</strong> This field accepts general text input for user messages or comments.
                    </div>
                </div>
                """;
    }
    
    private String determineFormType(PageAnalysisResponse analysis) {
        String title = analysis.getTitle().toLowerCase();
        String summary = analysis.getPageSummary().toLowerCase();
        
        if (title.contains("loan") || summary.contains("loan")) {
            return "Loan Application Form";
        } else if (title.contains("register") || summary.contains("register")) {
            return "Registration Form";
        } else if (title.contains("contact") || summary.contains("contact")) {
            return "Contact Form";
        } else if (title.contains("checkout") || summary.contains("checkout")) {
            return "Checkout Form";
        } else if (title.contains("survey") || summary.contains("survey")) {
            return "Survey Form";
        } else {
            return "Data Collection Form";
        }
    }
}
