// Gerenciamento do Carrinho
class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartBadge();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Abrir modal do carrinho
        document.querySelector('#cartButton').addEventListener('click', () => {
            this.openCartModal();
        });

        // Atualizar quantidade no carrinho
        document.addEventListener('click', (e) => {
            if (e.target.matches('.quantity-btn')) {
                const productId = parseInt(e.target.dataset.productId);
                const action = e.target.dataset.action;
                this.updateQuantity(productId, action);
            }
        });

        // Botão de finalizar compra
        document.querySelector('#checkoutButton').addEventListener('click', () => {
            if (this.cart.length === 0) {
                this.showNotification('Seu carrinho está vazio!', 'warning');
                return;
            }

            if (!userManager.currentUser) {
                const cartModal = bootstrap.Modal.getInstance(document.getElementById('cartModal'));
                cartModal.hide();
                
                const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
                const loginModalElement = document.getElementById('loginModal');
                
                // Adiciona mensagem de cadastro
                const modalBody = loginModalElement.querySelector('.modal-body');
                const registerMessage = document.createElement('div');
                registerMessage.className = 'mt-3 text-center';
                registerMessage.innerHTML = `
                    <p class="mb-2">Você ainda não tem conta na Agrodel?</p>
                    <button class="btn btn-outline-primary" onclick="document.querySelector('#loginModal .btn-close').click(); new bootstrap.Modal(document.getElementById('registerModal')).show()">
                        Criar conta agora
                    </button>
                `;
                
                if (!modalBody.querySelector('.mt-3.text-center')) {
                    modalBody.appendChild(registerMessage);
                }
                
                loginModal.show();
                return;
            }

            alert('Compra finalizada com sucesso!');
            this.cart = [];
            this.saveCart();
            this.updateCartBadge();
            bootstrap.Modal.getInstance(document.getElementById('cartModal')).hide();
        });
    }

    addToCart(product) {
        const existingProduct = this.cart.find(item => item.id === product.id);
        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            this.cart.push({ ...product, quantity: 1 });
        }
        this.saveCart();
        this.updateCartBadge();
        this.showNotification('Produto adicionado ao carrinho!');
    }

    removeFromCart(productId) {
        this.cart = this.cart.filter(item => item.id !== parseInt(productId));
        this.saveCart();
        this.updateCartBadge();
        this.renderCartItems();
    }

    updateQuantity(productId, action) {
        const product = this.cart.find(item => item.id === productId);
        if (product) {
            if (action === 'increase') {
                product.quantity += 1;
            } else if (action === 'decrease') {
                product.quantity -= 1;
                if (product.quantity <= 0) {
                    this.removeFromCart(productId);
                    return;
                }
            }
            this.saveCart();
            this.updateCartBadge();
            this.renderCartItems();
        }
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    updateCartBadge() {
        const badge = document.querySelector('#cartButton .badge');
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        badge.textContent = totalItems;
    }

    calculateTotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    openCartModal() {
        this.renderCartItems();
        const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
        cartModal.show();
    }

    renderCartItems() {
        const cartItems = document.querySelector('#cartItems');
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p class="text-center">Seu carrinho está vazio</p>';
            document.querySelector('#cartSubtotal').textContent = 'R$ 0,00';
            document.querySelector('#cartTotal').textContent = 'R$ 0,00';
            return;
        }

        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item d-flex align-items-center mb-3 p-2 border rounded">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image me-3" style="width: 80px; height: 80px; object-fit: cover;">
                <div class="flex-grow-1">
                    <h6 class="mb-0">${item.name}</h6>
                    <p class="text-muted mb-0">R$ ${item.price.toFixed(2)}</p>
                </div>
                <div class="quantity-controls d-flex align-items-center">
                    <button class="btn btn-sm btn-outline-secondary quantity-btn" data-product-id="${item.id}" data-action="decrease">-</button>
                    <span class="mx-2">${item.quantity}</span>
                    <button class="btn btn-sm btn-outline-secondary quantity-btn" data-product-id="${item.id}" data-action="increase">+</button>
                </div>
                <button class="btn btn-link text-danger ms-3" onclick="cartManager.removeFromCart('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Atualizar totais
        document.querySelector('#cartSubtotal').textContent = `R$ ${this.calculateTotal().toFixed(2)}`;
        document.querySelector('#cartTotal').textContent = `R$ ${this.calculateTotal().toFixed(2)}`;
    }

    showNotification(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = 'toast position-fixed bottom-0 end-0 m-3';
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="toast-body bg-${type} text-white rounded">
                <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}-circle me-2"></i>${message}
            </div>
        `;
        document.body.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
        bsToast.show();
        toast.addEventListener('hidden.bs.toast', () => toast.remove());
    }
}

// Gerenciamento do Tema
class ThemeManager {
    constructor() {
        this.theme = localStorage.getItem('theme') || 'light';
        this.setupTheme();
        this.setupEventListeners();
    }

    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        this.updateThemeIcon();
    }

    setupEventListeners() {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', this.theme);
        this.setupTheme();
    }

    updateThemeIcon() {
        const themeIcon = document.querySelector('#themeToggle i');
        if (themeIcon) {
            themeIcon.className = `fas ${this.theme === 'dark' ? 'fa-sun' : 'fa-moon'}`;
        }
    }
}

// Gerenciamento de Usuário
class UserManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.setupEventListeners();
        this.updateUserInterface();
    }

    setupEventListeners() {
        // Cadastro
        document.querySelector('#registerForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const userData = {
                name: formData.get('name'),
                email: formData.get('email'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword')
            };

            if (userData.password !== userData.confirmPassword) {
                this.showError('As senhas não coincidem');
                return;
            }

            if (this.users.some(user => user.email === userData.email)) {
                this.showError('Este email já está cadastrado');
                return;
            }

            this.users.push(userData);
            localStorage.setItem('users', JSON.stringify(this.users));
            this.login(userData);
            bootstrap.Modal.getInstance(document.querySelector('#registerModal')).hide();
            cartManager.showNotification('Cadastro realizado com sucesso!');
        });

        // Login
        document.querySelector('#loginModal form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.querySelector('input[type="email"]').value;
            const password = e.target.querySelector('input[type="password"]').value;

            const user = this.users.find(u => u.email === email && u.password === password);
            if (user) {
                this.login(user);
                bootstrap.Modal.getInstance(document.querySelector('#loginModal')).hide();
                cartManager.showNotification('Login realizado com sucesso!');
            } else {
                this.showError('Email ou senha incorretos');
            }
        });
    }

    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast position-fixed bottom-0 end-0 m-3';
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="toast-body bg-danger text-white rounded">
                <i class="fas fa-exclamation-circle me-2"></i>${message}
            </div>
        `;
        document.body.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast, { delay: 3000 });
        bsToast.show();
        toast.addEventListener('hidden.bs.toast', () => toast.remove());
    }

    login(userData) {
        this.currentUser = userData;
        localStorage.setItem('currentUser', JSON.stringify(userData));
        this.updateUserInterface();
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.updateUserInterface();
    }

    updateUserInterface() {
        const userDropdown = document.querySelector('#userDropdown');
        const dropdownMenu = document.querySelector('#userDropdown + .dropdown-menu');

        if (this.currentUser) {
            userDropdown.innerHTML = `<i class="fas fa-user"></i> ${this.currentUser.name}`;
            dropdownMenu.innerHTML = `
                <a class="dropdown-item" href="#/perfil">
                    <i class="fas fa-user-circle"></i> Meu Perfil
                </a>
                <a class="dropdown-item" href="#/pedidos">
                    <i class="fas fa-shopping-bag"></i> Meus Pedidos
                </a>
                <div class="dropdown-divider"></div>
                <a class="dropdown-item" href="#" onclick="userManager.logout()">
                    <i class="fas fa-sign-out-alt"></i> Sair
                </a>
            `;
        } else {
            userDropdown.innerHTML = `<i class="fas fa-user-circle"></i>`;
            dropdownMenu.innerHTML = `
                <a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#loginModal">
                    <i class="fas fa-sign-in-alt"></i> Entrar
                </a>
                <a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#registerModal">
                    <i class="fas fa-user-plus"></i> Cadastrar
                </a>
            `;
        }
    }
}

// Gerenciamento de Produtos
class ProductManager {
    constructor() {
        this.allProducts = [];
        this.loadFeaturedProducts();
        this.loadPromotions();
        this.loadNewProducts();
        this.loadRecommendedProducts();
        this.setupSearch();
    }

    setupSearch() {
        const searchForm = document.querySelector('form.d-flex');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const searchTerm = e.target.querySelector('input[type="search"]').value.toLowerCase();
                this.searchProducts(searchTerm);
            });
        }
    }

    searchProducts(term) {
        const searchResults = this.allProducts.filter(product => 
            product.name.toLowerCase().includes(term) || 
            product.description.toLowerCase().includes(term)
        );

        if (searchResults.length > 0) {
            // Limpar todas as seções
            document.querySelectorAll('section .row').forEach(row => {
                row.innerHTML = '';
            });

            // Mostrar resultados na seção de produtos em destaque
            const featuredSection = document.querySelector('.featured-products');
            featuredSection.querySelector('h2').textContent = 'Resultados da Pesquisa';
            this.renderProducts(searchResults, '.featured-products .row');

            // Esconder outras seções
            document.querySelector('.promotions').style.display = 'none';
            document.querySelector('.new-products').style.display = 'none';
            document.querySelector('.recommended-products').style.display = 'none';
            document.querySelector('.pet-care').style.display = 'none';
        } else {
            cartManager.showNotification('Nenhum produto encontrado', 'warning');
        }
    }

    async loadFeaturedProducts() {
        const products = [
            {
                id: 1,
                name: 'Ração Pedigree Adulto',
                price: 89.90,
                image: 'images/produtos/racao-pedigree.jpg',
                description: 'Ração premium para cães adultos com nutrientes essenciais'
            },
            {
                id: 2,
                name: 'Matabicheira Silverbac',
                price: 45.90,
                image: 'images/produtos/matabicheira.jpg',
                description: 'Proteção eficaz contra bicheiras e carrapatos'
            },
            {
                id: 3,
                name: 'Ração GranPlus',
                price: 75.90,
                image: 'images/produtos/racao-granplus.jpg',
                description: 'Ração premium para cães de todas as raças'
            },
            {
                id: 4,
                name: 'Vestimenta de Pulverização',
                price: 129.90,
                image: 'images/produtos/vestimenta.jpg',
                description: 'Equipamento de proteção para pulverização'
            }
        ];
        this.allProducts.push(...products);
        this.renderProducts(products, '.featured-products .row');
    }

    async loadPromotions() {
        const products = [
            {
                id: 5,
                name: 'Inseticida Poderoso',
                price: 39.90,
                image: 'images/produtos/inseticida.jpg',
                description: 'Combate eficaz contra pragas e insetos'
            },
            {
                id: 6,
                name: 'Furadeira Tramontina',
                price: 299.90,
                image: 'images/produtos/furadeira.jpg',
                description: 'Furadeira profissional de alta potência'
            }
        ];
        this.allProducts.push(...products);
        this.renderProducts(products, '.promotions .row');
    }

    async loadNewProducts() {
        const products = [
            {
                id: 7,
                name: 'Adubo Forth Flores',
                price: 24.90,
                image: 'images/produtos/adubo.jpg',
                description: 'Adubo especial para flores e jardins'
            },
            {
                id: 8,
                name: 'Pastilha Clorin',
                price: 19.90,
                image: 'images/produtos/clorin.jpg',
                description: 'Pastilha para tratamento de água'
            }
        ];
        this.allProducts.push(...products);
        this.renderProducts(products, '.new-products .row');
    }

    async loadRecommendedProducts() {
        const products = [
            {
                id: 9,
                name: 'Ração Premium Cães',
                price: 99.90,
                image: 'images/produtos/racao-premium.jpg',
                description: 'Ração super premium para cães adultos'
            },
            {
                id: 10,
                name: 'Kit Jardinagem',
                price: 149.90,
                image: 'images/produtos/kit-jardinagem.jpg',
                description: 'Kit completo para jardinagem'
            }
        ];
        this.renderProducts(products, '.recommended-products .row');
    }

    renderProducts(products, container) {
        const containerElement = document.querySelector(container);
        if (!containerElement) return;
        
        containerElement.innerHTML = products.map(product => `
            <div class="col-md-3 mb-4">
                <div class="card h-100">
                    <div class="card-img-wrapper">
                        <img src="${product.image}" class="card-img-top" alt="${product.name}" onerror="this.src='images/produto-default.jpg'">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text">${product.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="h5 mb-0">R$ ${product.price.toFixed(2)}</span>
                            <button class="btn btn-primary" onclick="cartManager.addToCart({
                                id: ${product.id},
                                name: '${product.name}',
                                price: ${product.price},
                                image: '${product.image}',
                                description: '${product.description}'
                            })">
                                <i class="fas fa-cart-plus"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa os gerenciadores
    window.themeManager = new ThemeManager();
    window.cartManager = new CartManager();
    window.userManager = new UserManager();
    window.productManager = new ProductManager();

    // Inicializa os filtros
    setupFilters();
});

// Função para configurar os filtros
function setupFilters() {
    const checkboxes = document.querySelectorAll('.filter-subcategory input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const selectedFilters = getSelectedFilters();
            filterProducts(selectedFilters);
        });
    });
}

// Função para obter os filtros selecionados
function getSelectedFilters() {
    const filters = {
        producao: [],
        pets: [],
        pragas: []
    };

    // Animais de Produção
    document.querySelectorAll('#filterProducao input:checked').forEach(input => {
        filters.producao.push(input.value);
    });

    // Pets
    document.querySelectorAll('#filterPets input:checked').forEach(input => {
        filters.pets.push(input.value);
    });

    // Pragas e Insetos
    document.querySelectorAll('#filterPragas input:checked').forEach(input => {
        filters.pragas.push(input.value);
    });

    return filters;
}

// Função para filtrar produtos
function filterProducts(filters) {
    const hasActiveFilters = Object.values(filters).some(category => category.length > 0);
    
    if (!hasActiveFilters) {
        // Se não houver filtros ativos, mostrar todos os produtos
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'block';
        });
        return;
    }

    // Lógica de filtragem aqui
    // Por enquanto, vamos apenas simular o filtro escondendo algumas seções
    document.querySelectorAll('section').forEach(section => {
        // Implementar lógica real de filtragem baseada nas categorias
        section.style.display = 'block';
    });
}

// Função para remover a tela de carregamento
function hideLoader() {
    const loader = document.querySelector('.loader-container');
    if (loader) {
        loader.classList.add('hidden');
    }
}

// Aguarda o carregamento completo da página
window.addEventListener('load', () => {
    // Aguarda um pequeno delay para garantir que tudo está renderizado
    setTimeout(hideLoader, 1000);
}); 