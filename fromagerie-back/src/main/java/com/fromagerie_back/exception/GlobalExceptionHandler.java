package com.fromagerie_back.exception;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.fromagerie_back.dto.ApiErrorResponse;

import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(AuthenticationException.class)
        public ResponseEntity<ApiErrorResponse> handleAuthenticationException() {
                ApiErrorResponse response = new ApiErrorResponse(
                                401,
                                "Identifiants invalides",
                                null);

                return ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body(response);
        }

        @ExceptionHandler(InvalidCredentialException.class)
        public ResponseEntity<ApiErrorResponse> handleInvalidCredential(
                        InvalidCredentialException exception) {
                ApiErrorResponse response = new ApiErrorResponse(
                                400,
                                exception.getMessage(),
                                null);

                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(response);
        }

        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<ApiErrorResponse> handleValidationException(
                        MethodArgumentNotValidException exception) {

                Map<String, String> errors = new HashMap<>();

                exception.getBindingResult()
                                .getFieldErrors()
                                .forEach(error -> errors.put(
                                                error.getField(),
                                                error.getDefaultMessage()));

                ApiErrorResponse response = new ApiErrorResponse(
                                400,
                                "Erreur de validation",
                                errors);

                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(response);
        }

        @ExceptionHandler(FromageNotFoundException.class)
        public ResponseEntity<ApiErrorResponse> handleFromageNotFound(
                        FromageNotFoundException exception) {

                ApiErrorResponse response = new ApiErrorResponse(
                                404,
                                exception.getMessage(),
                                null);

                return ResponseEntity
                                .status(HttpStatus.NOT_FOUND)
                                .body(response);
        }

        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ApiErrorResponse> handleResourceNotFound(
                        ResourceNotFoundException exception) {
                ApiErrorResponse response = new ApiErrorResponse(
                                404,
                                exception.getMessage(),
                                null);

                return ResponseEntity
                                .status(HttpStatus.NOT_FOUND)
                                .body(response);
        }

        @ExceptionHandler(NumeroLotConflictException.class)
        public ResponseEntity<ApiErrorResponse> handleNumeroLotConflict(
                        NumeroLotConflictException exception) {
                ApiErrorResponse response = new ApiErrorResponse(
                                409,
                                exception.getMessage(),
                                null);

                return ResponseEntity
                                .status(HttpStatus.CONFLICT)
                                .body(response);
        }

        @ExceptionHandler(InvalidAnalyticsFilterException.class)
        public ResponseEntity<ApiErrorResponse> handleInvalidAnalyticsFilter(
                        InvalidAnalyticsFilterException exception) {
                ApiErrorResponse response = new ApiErrorResponse(
                                400,
                                exception.getMessage(),
                                null);

                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(response);
        }

        @ExceptionHandler(BusinessValidationException.class)
        public ResponseEntity<ApiErrorResponse> handleBusinessValidation(
                        BusinessValidationException exception) {
                return ResponseEntity
                                .status(HttpStatus.BAD_REQUEST)
                                .body(new ApiErrorResponse(400, exception.getMessage(), null));
        }

        @ExceptionHandler(BusinessConflictException.class)
        public ResponseEntity<ApiErrorResponse> handleBusinessConflict(
                        BusinessConflictException exception) {
                return ResponseEntity
                                .status(HttpStatus.CONFLICT)
                                .body(new ApiErrorResponse(409, exception.getMessage(), null));
        }
}
