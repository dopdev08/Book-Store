package com.truyenhub.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class CheckoutPage extends BasePage {
    // Ô nhập không có id nên tìm theo nhãn đứng ngay trước nó
    private final By name = By.xpath("//label[text()='Họ và tên']/following-sibling::input");
    private final By phone = By.xpath("//label[text()='Số điện thoại']/following-sibling::input");
    private final By address = By.xpath("//label[text()='Địa chỉ giao hàng']/following-sibling::textarea");
    private final By submit = By.xpath("//button[text()='Tiếp tục']");

    public CheckoutPage(WebDriver driver) {
        super(driver);
    }

    /** Phương thức mặc định của trang là COD, giao nhanh. */
    public void placeCodOrder(String nameText, String phoneText, String addressText) {
        type(name, nameText);
        type(phone, phoneText);
        type(address, addressText);
        click(submit);
    }
}
