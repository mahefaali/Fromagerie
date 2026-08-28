package com.fromagerie_back.dto;

import java.util.List;

public record EtagereResponse(Long id, Integer numero, Integer ordre, List<RangeeResponse> rangees) {
}
