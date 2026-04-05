package com.teefi.kafka;

import com.teefi.config.KafkaConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class KafkaProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void sendOrderCreated(KafkaEvents.OrderCreatedEvent event) {
        send(KafkaConfig.ORDER_CREATED, event.getOrderId().toString(), event);
    }

    public void sendOrderPaid(KafkaEvents.OrderPaidEvent event) {
        send(KafkaConfig.ORDER_PAID, event.getOrderId().toString(), event);
    }

    public void sendPodShipped(KafkaEvents.PodShippedEvent event) {
        send(KafkaConfig.POD_SHIPPED, event.getOrderId().toString(), event);
    }

    public void sendEmailNotification(KafkaEvents.EmailNotificationEvent event) {
        send(KafkaConfig.NOTIFY_EMAIL, event.getTo(), event);
    }

    private void send(String topic, String key, Object payload) {
        CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(topic, key, payload);
        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("Failed to send event to topic {}: {}", topic, ex.getMessage());
            } else {
                log.debug("Sent event to {} partition {} offset {}",
                        topic,
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
            }
        });
    }
}
