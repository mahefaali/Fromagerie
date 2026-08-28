package com.fromagerie_back.dto;

public class CsrfTokenResponse {

    private final String token;
    private final String headerName;
    private final String parameterName;

    public CsrfTokenResponse(String token, String headerName, String parameterName) {
        this.token = token;
        this.headerName = headerName;
        this.parameterName = parameterName;
    }

    public String getToken() {
        return token;
    }

    public String getHeaderName() {
        return headerName;
    }

    public String getParameterName() {
        return parameterName;
    }
}
