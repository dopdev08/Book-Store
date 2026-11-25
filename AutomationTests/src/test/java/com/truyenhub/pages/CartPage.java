package com.truyenhub.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class CartPage extends BasePage {
    private final By firstTitle = By.cssSelector("tbody tr .fw-semibold");
    private final By total = By.xpath("//h4[contains(., 'Tổng tiền')]");
    private final By checkout = By.xpath("//button[text()='Thanh toán']");

    public CartPage(WebDriver driver) {
        super(driver);
    }

    public String firstTitle() {
        return visible(firstTitle).getText();
    }

    public String total() {
        return visible(total).getText();
    }

    public void checkout() {
        click(checkout);
    }
}
