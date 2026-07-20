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
                "You are a smart retail analytics assistant for CartIQ billing software. " +
                "Answer concisely in 2-3 sentences. Use only the data provided. Do not make up numbers.\n\n" +
                request.getContext() +
                "\n\nUser question: " + request.getQuestion() +
                "\n\nAnswer specifically using the data above. Be concise.";

            // Build Gemini API request body
            Map<String, Object> textPart  = Map.of("text", fullPrompt);
            Map<String, Object> parts     = Map.of("parts", List.of(textPart));
            Map<String, Object> body      = Map.of("contents", List.of(parts));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                GEMINI_URL + geminiApiKey,
                HttpMethod.POST,
                entity,
                Map.class
            );

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

            return ResponseEntity.status(e.getStatusCode())
                    .body(new AIResponse(e.getResponseBodyAsString()));
        }
    }
}
