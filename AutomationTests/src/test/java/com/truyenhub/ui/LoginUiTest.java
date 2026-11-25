package com.truyenhub.ui;

import com.truyenhub.core.TestData;
import com.truyenhub.pages.LoginPage;
import org.testng.annotations.Test;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class LoginUiTest extends BaseUiTest {

    @Test(description = "TC-AUTH-05: Đăng nhập đúng trên giao diện")
    public void loginWithValidAccount() {
        TestData.Customer customer = TestData.customer();
        LoginPage page = new LoginPage(driver);

        page.login(customer.email(), TestData.PASSWORD);

        page.waitForPath("/");
        assertTrue(page.loggedInName().contains(customer.username()), "Tên trên navbar: " + page.loggedInName());
    }

    @Test(description = "TC-AUTH-06: Đăng nhập sai trên giao diện")
    public void loginWithWrongPassword() {
        TestData.Customer customer = TestData.customer();
        LoginPage page = new LoginPage(driver);

        page.login(customer.email(), "sai-mat-khau");

        assertEquals(page.errorMessage(), "Email hoặc mật khẩu không đúng.");
        page.waitForPath("/login");
    }

    @Test(description = "TC-SEC-04: Khách mở trang quản trị thì bị đưa về trang đăng nhập")
    public void customerCannotOpenAdminPage() {
        TestData.Customer customer = TestData.customer();
        LoginPage page = new LoginPage(driver);
        page.login(customer.email(), TestData.PASSWORD);
        page.waitForPath("/");

        page.open("/admin/comics");

        page.waitForPath("/login");
    }
}
