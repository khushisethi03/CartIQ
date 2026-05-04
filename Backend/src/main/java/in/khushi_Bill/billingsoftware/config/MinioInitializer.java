package in.khushi_Bill.billingsoftware.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

@Component
@RequiredArgsConstructor
public class MinioInitializer {

    private final S3Client s3Client;

    @Value("${minio.bucket}")
    private String bucket;

    @PostConstruct
    public void init() {
        System.out.println("MinIO Init Started...");

        // 1. Create bucket if it doesn't exist
        try {
            s3Client.headBucket(HeadBucketRequest.builder().bucket(bucket).build());
            System.out.println("Bucket already exists: " + bucket);
        } catch (Exception e) {
            s3Client.createBucket(CreateBucketRequest.builder().bucket(bucket).build());
            System.out.println("Bucket created: " + bucket);
        }

        // 2. Set public-read policy so images are accessible via URL in browser
        String publicPolicy = String.format(
                "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\"," +
                        "\"Principal\":{\"AWS\":[\"*\"]},\"Action\":[\"s3:GetObject\"]," +
                        "\"Resource\":[\"arn:aws:s3:::%s/*\"]}]}", bucket);

        try {
            s3Client.putBucketPolicy(PutBucketPolicyRequest.builder()
                    .bucket(bucket)
                    .policy(publicPolicy)
                    .build());
            System.out.println("Public-read policy applied to bucket: " + bucket);
        } catch (Exception e) {
            System.err.println("Warning: Could not set bucket policy: " + e.getMessage());
        }
    }
}
