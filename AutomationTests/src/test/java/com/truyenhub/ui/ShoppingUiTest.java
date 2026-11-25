package com.truyenhub.ui;

import com.truyenhub.core.TestData;
import com.truyenhub.pages.CartPage;
import com.truyenhub.pages.CheckoutPage;
import com.truyenhub.pages.HomePage;
import com.truyenhub.pages.LoginPage;
import com.truyenhub.pages.OrdersPage;
import org.testng.annotations.Test;

import java.util.List;

import static org.testng.Assert.assertEquals;
import static org.testng.Assert.assertTrue;

public class ShoppingUiTest extends BaseUiTest {

    /** Đăng nhập bằng khách mới rồi về trang chủ. */
    private HomePage loginAsNewCustomer() {
        LoginPage login = new LoginPage(driver);
        login.login(TestData.customer().email(), TestData.PASSWORD);
        login.waitForPath("/");
        return new HomePage(driver);
    }

    @Test(description = "TC-CAT-01: Tìm truyện theo tên")
    public void searchByTitle() {
        TestData.Comic comic = TestData.comic(50_000, 10);
        HomePage home = new HomePage(driver);
        home.open("/");

        home.search(comic.title());

        assertEquals(home.comicTitles(), List.of(comic.title()));
    }

    @Test(description = "TC-CART-02: Thêm truyện vào giỏ trên giao diện")
    public void addComicToCart() {
        TestData.Comic comic = TestData.comic(50_000, 10);

        loginAsNewCustomer().addComicToCart(comic.title());

        CartPage cart = new CartPage(driver);
        cart.open("/cart");
        assertEquals(cart.firstTitle(), comic.title());
        assertTrue(cart.total().contains("50.000"), cart.total());
    }

    @Test(description = "TC-ORD-04: Mua COD trên giao diện")
    public void buyWithCod() {
        TestData.Comic comic = TestData.comic(50_000, 10);
        loginAsNewCustomer().addComicToCart(comic.title());
        CartPage cart = new CartPage(driver);
        cart.open("/cart");
        cart.checkout();

        new CheckoutPage(driver).placeCodOrder("Nguyễn Test", "0912345678", "1 Lê Lợi, Hà Nội");

        OrdersPage orders = new OrdersPage(driver);
        orders.waitForPath("/orders");
        String order = orders.firstOrder();
        assertTrue(order.contains(comic.title()), order);
        assertTrue(order.contains("70.000"), order); // 50.000 + ship 20.000
    }
}
