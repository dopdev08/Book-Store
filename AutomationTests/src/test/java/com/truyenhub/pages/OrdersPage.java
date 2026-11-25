package com.truyenhub.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class OrdersPage extends BasePage {
    private final By firstOrder = By.xpath("(//div[contains(@class, 'card-body')][contains(., 'Mã đơn')])[1]");

    public OrdersPage(WebDriver driver) {
        super(driver);
    }

    public String firstOrder() {
        return visible(firstOrder).getText();
    }
}
