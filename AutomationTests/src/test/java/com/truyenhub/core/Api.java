package com.truyenhub.core;

import io.restassured.RestAssured;
import io.restassured.http.ContentType;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

import java.util.Map;

/** Các lời gọi API dùng chung. */
public class Api {
    private static final String URL = "http://localhost:8080/api";

    /** token = null: khách chưa đăng nhập. */
    public static RequestSpecification as(String token) {
        RequestSpecification request = RestAssured.given().baseUri(URL).contentType(ContentType.JSON);
        return token == null ? request : request.header("Authorization", "Bearer " + token);
    }

    public static Response register(String username, String email, String password) {
        return as(null)
                .body(Map.of("username", username, "email", email, "password", password))
                .post("/auth/register");
    }

    public static Response login(String email, String password) {
        return as(null).body(Map.of("email", email, "password", password)).post("/auth/login");
    }

    public static Response addToCart(String token, long comicId, int quantity) {
        return as(token).body(Map.of("comicId", comicId, "quantity", quantity)).post("/cart/add");
    }

    /** Đặt hàng COD, giao FAST với mọi truyện trong giỏ. couponCode rỗng = không dùng mã. */
    public static Response order(String token, String couponCode) {
        return as(token)
                .body(Map.of(
                        "receiverName", "Nguyễn Test",
                        "phone", "0912345678",
                        "address", "1 Lê Lợi, Hà Nội",
                        "paymentMethod", "COD",
                        "shippingMethod", "FAST",
                        "couponCode", couponCode))
                .post("/orders");
    }
}
