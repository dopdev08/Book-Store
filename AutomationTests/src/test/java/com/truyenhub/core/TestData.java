package com.truyenhub.core;

import io.restassured.response.Response;

import java.util.Map;
import java.util.UUID;

/** Tạo dữ liệu riêng cho từng test, tên không trùng nhau. */
public class TestData {
    public static final String PASSWORD = "123456";

    public record Customer(long id, String username, String email, String token) {
    }

    public record Comic(long id, String title) {
    }

    public static String unique(String prefix) {
        return prefix + UUID.randomUUID().toString().substring(0, 8);
    }

    public static String adminToken() {
        Response response = Api.login("admin@truyenhub.local", PASSWORD);
        response.then().statusCode(200);
        return response.path("token");
    }

    public static Customer customer() {
        String username = unique("khach_");
        String email = username + "@test.local";
        Api.register(username, email, PASSWORD).then().statusCode(200);

        Response login = Api.login(email, PASSWORD);
        return new Customer(login.jsonPath().getLong("id"), username, email, login.path("token"));
    }

    public static Comic comic(int price, int stock) {
        String title = unique("Truyện ");
        Response response = Api.as(adminToken())
                .body(Map.of("title", title, "price", price, "categoryName", "Test", "stock", stock))
                .post("/comics");
        response.then().statusCode(200);
        return new Comic(response.jsonPath().getLong("id"), title);
    }

    /** Tồn kho hiện tại. Dùng API của admin vì truyện hết hàng không còn hiện với khách. */
    public static int stock(long comicId) {
        return Api.as(adminToken()).get("/comics/admin/all")
                .jsonPath().getInt("find { it.id == " + comicId + " }.stock");
    }

    /** Tạo mã giảm theo phần trăm và trả về mã. */
    public static String percentCoupon(int percent, int maxDiscount) {
        String code = unique("MA").toUpperCase();
        Api.as(adminToken())
                .body(Map.of("code", code, "type", "PERCENT", "value", percent, "maxDiscount", maxDiscount))
                .post("/admin/discount-codes")
                .then().statusCode(200);
        return code;
    }
}
