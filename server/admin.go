package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// Admin store methods — semua operasi CRUD produk & varian.

func (s *Store) CreateProduct(p *Product) (int64, error) {
	fields, _ := json.Marshal(p.InputFields)
	res, err := s.db.Exec(`INSERT INTO products (slug,name,category,brand,image,description,warranty_days,input_fields) VALUES (?,?,?,?,?,?,?,?)`,
		p.Slug, p.Name, p.Category, p.Brand, p.Image, p.Description, p.WarrantyDays, string(fields))
	if err != nil {
		return 0, err
	}
	return res.LastInsertId()
}

func (s *Store) UpdateProduct(p *Product) error {
	fields, _ := json.Marshal(p.InputFields)
	_, err := s.db.Exec(`UPDATE products SET name=?,category=?,brand=?,image=?,description=?,warranty_days=?,input_fields=? WHERE id=?`,
		p.Name, p.Category, p.Brand, p.Image, p.Description, p.WarrantyDays, string(fields), p.ID)
	return err
}

func (s *Store) DeleteProduct(id int64) error {
	_, err := s.db.Exec(`DELETE FROM variants WHERE product_id=?`, id)
	if err != nil {
		return err
	}
	_, err = s.db.Exec(`DELETE FROM products WHERE id=?`, id)
	return err
}

func (s *Store) CreateVariant(v *Variant) error {
	res, err := s.db.Exec(`INSERT INTO variants (product_id,sku,name,sell_price,promo_price,display_price,cost_price,stock,region,subcategory,status) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
		v.ProductID, v.SKU, v.Name, v.SellPrice, v.PromoPrice, v.DisplayPrice, v.CostPrice, v.Stock, v.Region, v.Subcategory, v.Status)
	if err != nil {
		return err
	}
	v.ID, _ = res.LastInsertId()
	return nil
}

func (s *Store) UpdateVariant(v *Variant) error {
	_, err := s.db.Exec(`UPDATE variants SET sku=?,name=?,sell_price=?,promo_price=?,display_price=?,cost_price=?,stock=?,region=?,subcategory=?,status=? WHERE id=?`,
		v.SKU, v.Name, v.SellPrice, v.PromoPrice, v.DisplayPrice, v.CostPrice, v.Stock, v.Region, v.Subcategory, v.Status, v.ID)
	return err
}

func (s *Store) DeleteVariant(id int64) error {
	_, err := s.db.Exec(`DELETE FROM variants WHERE id=?`, id)
	return err
}

// ── Handlers ───────────────────────────────────────────────────────────────

// adminOnly adalah middleware sederhana: hanya untuk demo, key via header X-Admin-Key.
func (s *Server) adminOnly(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		key := r.Header.Get("X-Admin-Key")
		if key == "" || key != s.cfg.JWTSecret { // ponytail: pakai JWTSecret sbg admin key (dev)
			writeErr(w, 401, "admin key required")
			return
		}
		next(w, r)
	}
}

// GET /api/admin/products — list lengkap (termasuk cost_price utk margin)
func (s *Server) handleAdminProducts(w http.ResponseWriter, r *http.Request) {
	rows, err := s.store.db.Query(`SELECT id,slug,name,category,brand,image,description,warranty_days FROM products ORDER BY id`)
	if err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	defer rows.Close()
	var products []AdminProduct
	for rows.Next() {
		var p AdminProduct
		if err := rows.Scan(&p.ID, &p.Slug, &p.Name, &p.Category, &p.Brand, &p.Image, &p.Description, &p.WarrantyDays); err != nil {
			continue
		}
		products = append(products, p)
	}
	for i := range products {
		vfull, _ := s.store.AdminVariants(products[i].ID)
		products[i].Variants = vfull
	}
	writeJSON(w, 200, map[string]any{"products": products})
}

// AdminVariants — variant dengan cost_price (khusus admin)
func (s *Store) AdminVariants(productID int64) ([]AdminVariant, error) {
	rows, err := s.db.Query(`SELECT id,product_id,sku,name,sell_price,promo_price,display_price,cost_price,stock,region,subcategory,status FROM variants WHERE product_id=? ORDER BY sell_price`, productID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []AdminVariant
	for rows.Next() {
		var v AdminVariant
		if err := rows.Scan(&v.ID, &v.ProductID, &v.SKU, &v.Name, &v.SellPrice, &v.PromoPrice, &v.DisplayPrice, &v.CostPrice, &v.Stock, &v.Region, &v.Subcategory, &v.Status); err != nil {
			return nil, err
		}
		out = append(out, v)
	}
	return out, nil
}

// POST /api/admin/products — create/update
func (s *Server) handleAdminSaveProduct(w http.ResponseWriter, r *http.Request) {
	var p Product
	if err := json.NewDecoder(r.Body).Decode(&p); err != nil {
		writeErr(w, 400, "invalid body")
		return
	}
	if p.ID == 0 {
		id, err := s.store.CreateProduct(&p)
		if err != nil {
			writeErr(w, 500, err.Error())
			return
		}
		p.ID = id
	} else {
		if err := s.store.UpdateProduct(&p); err != nil {
			writeErr(w, 500, err.Error())
			return
		}
	}
	writeJSON(w, 200, map[string]any{"product": p})
}

// POST /api/admin/variants — create/update
func (s *Server) handleAdminSaveVariant(w http.ResponseWriter, r *http.Request) {
	var v Variant
	if err := json.NewDecoder(r.Body).Decode(&v); err != nil {
		writeErr(w, 400, "invalid body")
		return
	}
	if v.Status == "" {
		v.Status = "active"
	}
	if v.ID == 0 {
		if err := s.store.CreateVariant(&v); err != nil {
			writeErr(w, 500, err.Error())
			return
		}
	} else {
		if err := s.store.UpdateVariant(&v); err != nil {
			writeErr(w, 500, err.Error())
			return
		}
	}
	writeJSON(w, 200, map[string]any{"variant": v})
}

// DELETE /api/admin/variants/{id}
func (s *Server) handleAdminDeleteVariant(w http.ResponseWriter, r *http.Request) {
	var id int64
	fmt.Sscanf(r.PathValue("id"), "%d", &id)
	if err := s.store.DeleteVariant(id); err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	writeJSON(w, 200, map[string]string{"status": "deleted"})
}

// DELETE /api/admin/products/{id}
func (s *Server) handleAdminDeleteProduct(w http.ResponseWriter, r *http.Request) {
	var id int64
	fmt.Sscanf(r.PathValue("id"), "%d", &id)
	if err := s.store.DeleteProduct(id); err != nil {
		writeErr(w, 500, err.Error())
		return
	}
	writeJSON(w, 200, map[string]string{"status": "deleted"})
}
