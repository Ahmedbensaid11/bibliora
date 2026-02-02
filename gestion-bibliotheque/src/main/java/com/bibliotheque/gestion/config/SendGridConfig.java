package com.bibliotheque.gestion.config;

import com.sendgrid.SendGrid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
@Slf4j
public class SendGridConfig {

    @Value("${SENDGRID_API_KEY}")
    private String apiKey;

    @Bean
    public SendGrid sendGridClient() {
        log.info("Initializing SendGrid client");

        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("your-sendgrid-api-key")) {
            log.warn("SendGrid API key not properly configured. Email sending may fail.");
        }

        return new SendGrid(apiKey);
    }

    @Bean(name = "emailTaskExecutor")
    public Executor emailTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("email-");
        executor.initialize();
        log.info("Email task executor initialized with core pool size: 5, max pool size: 10");
        return executor;
    }
}
