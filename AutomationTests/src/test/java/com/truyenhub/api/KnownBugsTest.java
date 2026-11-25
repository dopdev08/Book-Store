package com.truyenhub.api;

import com.truyenhub.core.Api;
import com.truyenhub.core.TestData;
import org.testng.annotations.Test;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.hamcrest.Matchers.anyOf;
import static org.hamcrest.Matchers.is;
import static org.testng.Assert.assertEquals;

/** Lỗi thật chưa sửa nên các test này đang đỏ. Khi app sửa xong, chuyển test sang lớp tương ứng. */
public class KnownBugsTest {

    @Test(description = "TC-ORD-03 / BUG-01: 8 khách cùng mua cuốn cuối thì chỉ 1 đơn thành công")
    public void onlyOneCustomerCanBuyLastCopy() {
        long comicId = TestData.comic(50_000, 1).id();
        List<TestData.Customer> customers = new ArrayList<>();
        for (int i = 0; i < 8; i++) {
            TestData.Customer customer = TestData.customer();
            Api.addToCart(customer.token(), comicId, 1);
            customers.add(customer);
        }

        // parallelStream: gửi các đơn cùng lúc thay vì lần lượt
        List<Integer> statuses = customers.parallelStream()
                .map(customer -> Api.order(customer.token(), "").statusCode())
                .toList();

        assertEquals(Collections.frequency(statuses, 200), 1, "Số đơn thành công, mã HTTP: " + statuses);
    }

    @Test(description = "TC-SEC-03 / BUG-02: Tài khoản bị khóa không dùng được token cũ")
    public void lockedAccountCannotUseOldToken() {
        TestData.Customer customer = TestData.customer();
        Api.as(TestData.adminToken()).queryParam("active", false)
                .put("/admin/users/" + customer.id() + "/active")
                .then().statusCode(200);

        Api.as(customer.token()).get("/users/me").then().statusCode(anyOf(is(401), is(403)));
    }

    @Test(description = "TC-AUTH-02 / BUG-03: Đăng ký mật khẩu 5 ký tự phải trả 400")
    public void registerWithFiveCharacterPassword() {
        String username = TestData.unique("khach_");

        Api.register(username, username + "@test.local", "abc12").then().statusCode(400);
    }
}
