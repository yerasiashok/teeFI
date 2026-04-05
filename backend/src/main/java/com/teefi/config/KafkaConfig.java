package com.teefi.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaConfig {

    public static final String ORDER_CREATED   = "order.created";
    public static final String ORDER_PAID      = "order.paid";
    public static final String POD_SUBMITTED   = "pod.submitted";
    public static final String POD_SHIPPED     = "pod.shipped";
    public static final String NOTIFY_EMAIL    = "notify.email";

    @Bean public NewTopic orderCreated()  { return TopicBuilder.name(ORDER_CREATED).partitions(3).replicas(1).build(); }
    @Bean public NewTopic orderPaid()     { return TopicBuilder.name(ORDER_PAID).partitions(3).replicas(1).build(); }
    @Bean public NewTopic podSubmitted()  { return TopicBuilder.name(POD_SUBMITTED).partitions(3).replicas(1).build(); }
    @Bean public NewTopic podShipped()    { return TopicBuilder.name(POD_SHIPPED).partitions(3).replicas(1).build(); }
    @Bean public NewTopic notifyEmail()   { return TopicBuilder.name(NOTIFY_EMAIL).partitions(3).replicas(1).build(); }
}
