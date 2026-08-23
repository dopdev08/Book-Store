// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { cartApi } from "../api/cartApi";
import { useToast } from "./ToastContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  const normalizeStock = (stock) => {
    const n = Number(stock);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.floor(n));
  };

  const calcTotal = (items) =>
    (items || []).reduce(
      (sum, item) => sum + (Number(item.comic?.price || 0) * Number(item.quantity || 0)),
      0
    );

  const loadCart = async ({ silent = false } = {}) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCartItems([]);
      setTotalPrice(0);
      return;
    }

    try {
      setLoading(true);
      const data = await cartApi.getCart(); // List<CartItem>
      const items = data || [];

      setCartItems(items);
      setTotalPrice(calcTotal(items));

      // ✅ chỉ cảnh báo (không auto sửa) nếu có item hết hàng / vượt tồn
      const invalids = items.filter((it) => {
        const stock = normalizeStock(it?.comic?.stock);
        const qty = Number(it?.quantity || 0);
        return stock <= 0 || qty > stock;
      });

      if (!silent && invalids.length > 0) {
        showToast("Giỏ hàng có sản phẩm hết hàng hoặc vượt tồn kho. Vui lòng kiểm tra lại.");
      }
    } catch (e) {
      console.error("Lỗi tải giỏ hàng:", e);
      if (!silent) showToast("Không thể tải giỏ hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helper: tìm item trong giỏ theo comicId
  const findCartItemByComicId = (comicId) => {
    return cartItems.find((it) => it?.comic?.id === comicId);
  };

  // 🟦 Thêm vào giỏ (có chặn tồn kho)
  const addToCart = async (comic, quantity = 1) => {
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("Bạn cần đăng nhập để thêm vào giỏ!");
      return;
    }

    if (!comic?.id) {
      showToast("Sản phẩm không hợp lệ!");
      return;
    }

    const stock = normalizeStock(comic?.stock);
    if (stock <= 0) {
      showToast("Sản phẩm đã hết hàng.");
      return;
    }

    let qty = Number(quantity);
    if (!Number.isFinite(qty)) qty = 1;
    qty = Math.max(1, Math.floor(qty));

    // ✅ nếu đã có trong giỏ: không cho vượt tồn kho
    const existing = findCartItemByComicId(comic.id);
    const existingQty = Number(existing?.quantity || 0);
    const allowedAdd = Math.max(0, stock - existingQty);

    if (allowedAdd <= 0) {
      showToast(`Bạn đã có tối đa ${stock} sản phẩm trong giỏ (bằng tồn kho).`);
      return;
    }

    if (qty > allowedAdd) {
      qty = allowedAdd;
      showToast(`Tồn kho còn ${stock}. Đã tự điều chỉnh số lượng thêm vào: ${qty}.`);
    }

    try {
      await cartApi.addToCart(comic.id, qty);
      await loadCart({ silent: true });
      showToast(`✔ Đã thêm "${comic.title}" vào giỏ hàng!`);
    } catch (e) {
      console.error("Lỗi thêm vào giỏ:", e.response?.data || e.message);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        "Không thể thêm vào giỏ hàng!";
      showToast(msg);
    }
  };

  // 🟦 Cập nhật số lượng (clamp theo stock)
  const updateQuantity = async (cartItemId, quantity) => {
    // tìm item để biết stock
    const item = cartItems.find((it) => it.id === cartItemId);
    const stock = normalizeStock(item?.comic?.stock);

    let qty = Number(quantity);
    if (!Number.isFinite(qty)) {
      showToast("Số lượng không hợp lệ.");
      return;
    }
    qty = Math.floor(qty);

    // hết hàng → tự remove
    if (stock <= 0) {
      try {
        await cartApi.removeItem(cartItemId);
        await loadCart({ silent: true });
        showToast("Sản phẩm đã hết hàng và đã được xoá khỏi giỏ.");
      } catch (e) {
        console.error("Lỗi xoá item hết hàng:", e);
        showToast("Không thể cập nhật giỏ hàng.");
      }
      return;
    }

    if (qty < 1) qty = 1;

    if (qty > stock) {
      qty = stock;
      showToast(`Tồn kho chỉ còn ${stock}. Đã tự điều chỉnh số lượng.`);
    }

    try {
      await cartApi.updateQuantity(cartItemId, qty);
      await loadCart({ silent: true });
      showToast("Đã cập nhật số lượng!");
    } catch (e) {
      console.error("Lỗi cập nhật số lượng:", e.response?.data || e.message);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data ||
        "Không thể cập nhật số lượng!";
      showToast(msg);
    }
  };

  // 🟦 Xóa 1 item
  const removeFromCart = async (cartItemId) => {
    try {
      await cartApi.removeItem(cartItemId);
      await loadCart({ silent: true });
      showToast("Đã xóa khỏi giỏ hàng!");
    } catch (e) {
      console.error("Lỗi xóa item:", e);
      showToast("Không thể xóa item!");
    }
  };

  // 🟦 Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    try {
      await cartApi.clearCart();
      await loadCart({ silent: true });
      showToast("Giỏ hàng đã được làm trống!");
    } catch (e) {
      console.error("Lỗi xóa giỏ hàng:", e);
      showToast("Không thể xóa toàn bộ giỏ hàng!");
    }
  };

  // (tuỳ chọn) expose trạng thái invalid để UI dùng (nếu cần)
  const hasInvalidItems = useMemo(() => {
    return cartItems.some((it) => {
      const stock = normalizeStock(it?.comic?.stock);
      const qty = Number(it?.quantity || 0);
      return stock <= 0 || qty > stock || qty <= 0;
    });
  }, [cartItems]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalPrice,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        reloadCart: loadCart,
        hasInvalidItems, // optional
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
