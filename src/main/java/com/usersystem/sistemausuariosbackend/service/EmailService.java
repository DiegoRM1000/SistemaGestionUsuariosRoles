package com.usersystem.sistemausuariosbackend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import sendinblue.ApiClient;
import sendinblue.ApiException;
import sendinblue.Configuration;
import sendinblue.auth.ApiKeyAuth;
import sibApi.TransactionalEmailsApi;
import sibModel.SendSmtpEmail;
import sibModel.SendSmtpEmailSender;
import sibModel.SendSmtpEmailTo;


import java.util.Collections;

@Service
public class EmailService {

    private final TransactionalEmailsApi apiInstance;
    private final String fromEmail;

    public EmailService(@Value("${brevo.api.key}") String apiKey, @Value("${brevo.from.email}") String fromEmail) {
        ApiClient defaultClient = Configuration.getDefaultApiClient();

        // Configura la autenticación con la clave API
        ApiKeyAuth apiKeyAuth = (ApiKeyAuth) defaultClient.getAuthentication("api-key");
        apiKeyAuth.setApiKey(apiKey);

        this.apiInstance = new TransactionalEmailsApi(defaultClient);
        this.fromEmail = fromEmail;
    }

    public void sendEmail(String toEmail, String subject, String body) {
        SendSmtpEmail sendSmtpEmail = new SendSmtpEmail();
        sendSmtpEmail.setSender(new SendSmtpEmailSender().email(this.fromEmail));
        sendSmtpEmail.setTo(Collections.singletonList(new SendSmtpEmailTo().email(toEmail)));
        sendSmtpEmail.setSubject(subject);
        sendSmtpEmail.setHtmlContent(body);

        try {
            apiInstance.sendTransacEmail(sendSmtpEmail);
            System.out.println("Correo enviado exitosamente a: " + toEmail);
        } catch (ApiException e) {
            System.err.println("Error al enviar el correo electrónico: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al enviar el correo: " + e.getMessage(), e);
        }
    }
}