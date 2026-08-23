// src/components/SearchBar.jsx
import { Row, Col, Form } from "react-bootstrap";

function SearchBar({
  search,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  categories = [],
  searchPlaceholder = "Tìm kiếm truyện...",
}) {
  return (
    <Row className="mb-4">
      <Col md={8}>
        <Form.Control
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </Col>

      <Col md={4} className="mt-2 mt-md-0">
        <Form.Select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="ALL">Tất cả thể loại</option>
          {categories.map((cate) => (
            <option key={cate} value={cate}>
              {cate}
            </option>
          ))}
        </Form.Select>
      </Col>
    </Row>
  );
}

export default SearchBar;
