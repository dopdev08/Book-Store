package com.truyenhub.api;

import com.truyenhub.core.Api;
import com.truyenhub.core.TestData;
import org.testng.annotations.Test;

import static org.hamcrest.Matchers.anyOf;
import static org.hamcrest.Matchers.is;

public class SecurityApiTest {

    @Test(description = "TC-SEC-01: Xem giỏ hàng không có token")
    public void cartWithoutToken() {
        Api.as(null).get("/cart").then().statusCode(anyOf(is(401), is(403)));
    }

    @Test(description = "TC-SEC-02: Khách gọi API quản trị")
    public void customerCannotCallAdminApi() {
        Api.as(TestData.customer().token()).get("/admin/users").then().statusCode(403);
    }
}
