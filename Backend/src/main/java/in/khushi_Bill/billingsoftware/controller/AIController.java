package in.khushi_Bill.billingsoftware.controller;

import in.khushi_Bill.billingsoftware.io.AIRequest;
import in.khushi_Bill.billingsoftware.io.AIResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AIController {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=";

    @PostMapping("/ask")
    public ResponseEntity<AIResponse> ask(@RequestBody AIRequest request) {
        try {
            String fullPrompt =
                    """
                    You are CartIQ AI.
                    
                    You answer only from the dashboard data provided.
                    
                    Rules:
                    
                    - Never invent numbers.
                    - If information is missing, say "Data not available."
                    - Keep responses under 100 words.
                    - Use bullet points whenever possible.
                    - Format monetary values with ₹.
                    - If applicable, end with a short business insight.
                    
                    Dashboard Data:
                    
                    %s
                    
                    User Question:
                    
                    %s
                    """.formatted(request.getContext(), request.getQuestion());

            // Build Gemini API request body
            Map<String, Object> textPart  = Map.of("text", fullPrompt);
            Map<String, Object> parts     = Map.of("parts", List.of(textPart));
            Map<String, Object> body      = Map.of("contents", List.of(parts));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = null;

            for (int attempt = 1; attempt <= 3; attempt++) {

                try {

                    response = restTemplate.exchange(
                            GEMINI_URL + geminiApiKey,
                            HttpMethod.POST,
                            entity,
                            Map.class
                    );

                    break;

                } catch (org.springframework.web.client.HttpStatusCodeException e) {

                    if (e.getStatusCode() == HttpStatus.SERVICE_UNAVAILABLE && attempt < 3) {

                        System.out.println("Gemini busy... Retrying (" + attempt + "/3)");

                        try {
                            Thread.sleep(2000);
                        } catch (InterruptedException ex) {
                            Thread.currentThread().interrupt();
                        }

                    } else {
                        throw e;
                    }
                }
            }

            // Extract text from Gemini response
            // Structure: candidates[0].content.parts[0].text
            List<Map<String, Object>> candidates =
                (List<Map<String, Object>>) response.getBody().get("candidates");
            Map<String, Object> content =
                (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> responseParts =
                (List<Map<String, Object>>) content.get("parts");
            String answer = (String) responseParts.get(0).get("text");

            return ResponseEntity.ok(new AIResponse(answer));

        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            System.out.println("Status: " + e.getStatusCode());
            System.out.println("Body:");
            System.out.println(e.getResponseBodyAsString());

            String message;

            if (e.getStatusCode() == HttpStatus.SERVICE_UNAVAILABLE) {

                message = "Gemini AI is currently experiencing high demand. Please try again in a few moments.";

            } else {

                message = "Unable to contact Gemini AI.";
            }

            return ResponseEntity
                    .status(e.getStatusCode())
                    .body(new AIResponse(message));
        }
    }
}
