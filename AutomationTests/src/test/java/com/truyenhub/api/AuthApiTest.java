package com.truyenhub.api;

import com.truyenhub.core.Api;
import com.truyenhub.core.TestData;
import org.testng.annotations.Test;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.notNullValue;

public class AuthApiTest {

    @Test(description = "TC-AUTH-01: Đăng ký mật khẩu đúng 6 ký tự")
    public void registerWithSixCharacterPassword() {
        String username = TestData.unique("khach_");
        String email = username + "@test.local";

        Api.register(username, email, "abc123").then().statusCode(200);

        Api.login(email, "abc123").then().statusCode(200);
    }

    @Test(description = "TC-AUTH-03: Đăng nhập đúng")
    public void loginWithValidAccount() {
        TestData.Customer customer = TestData.customer();

        Api.login(customer.email(), TestData.PASSWORD).then()
                .statusCode(200)
                .body("token", notNullValue())
                .body("username", equalTo(customer.username()))
                .body("roles", hasItem("ROLE_USER"));
    }

    @Test(description = "TC-AUTH-04: Đăng nhập sai mật khẩu")
    public void loginWithWrongPassword() {
        TestData.Customer customer = TestData.customer();

        Api.login(customer.email(), "sai-mat-khau").then()
                .statusCode(401)
                .body("message", equalTo("Email hoặc mật khẩu không đúng."));
    }
}
