Vue.createApp({
    data(){
        return{
            storageCarrito: [],
            client:[],
            subtotalCarrito: 0,
            invoices:[],
            paymentMethods: 0,
            shippingType: 0,
            checkboxChecked:'',
            precioTotal:0,
            

        }
    },
    created(){
        let carrito
        carrito = JSON.parse(localStorage.getItem("cart"));
        // SI NO EXISTE CAMBIAMOS EL UNDEFINED POR UN ARRAY VACIO PARA PODER TRABAJAR CON EL CARRITO
        if (!carrito) {
            this.storageCarrito = []
        }
        // SI EXISTE LO ALMACENAMOS EN STORAGECARRITO
        else {
            this.storageCarrito = carrito;
        }
        // ITERAMOS EL CARRITO Y DEFINIMOS LA SUMA DE LOS SUBTOTALES
        let total = 0;
        this.storageCarrito.forEach(producto => {
            total += producto.subtotal
        });

        this.subtotalCarrito = total;
        this.storageLength = this.storageCarrito.length;

        axios.get(`/api/products`)
            .then(result => {
                this.products = result.data
                
                axios.get('/api/clients/current')
                .then(results =>{
                    this.client = results.data
                })

                axios.get('/api/invoicesdto')
                .then(results =>{
                    this.invoices = results.data
                })

            })
                
            this.precioTotal = this.subtotalCarrito;   

    },

    
    methods:{



        logOut() {
            axios.post('/api/logout').then(response => {
                if (response.status === 200) {
                    const Toast = Swal.mixin({
                        toast: true,
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 2000,
                        timerProgressBar: true,
                        didOpen: (toast) => {
                            toast.addEventListener('mouseenter', Swal.stopTimer)
                            toast.addEventListener('mouseleave', Swal.resumeTimer)
                        }
                    })

                    Toast.fire({
                        icon: 'success',
                        title: 'Deslogueado con éxito'
                    })
                    setTimeout(function () {
                        window.location.href = "/web/index.html";
                    }, 2000)
                }
            })
        },

        sumatoriaCarrito(){
            let sumatoria = []
            this.storageCarrito.forEach(producto => {
                sumatoria.push(producto.subtotal)
                
            })
            return sumatoria.reduce((a,b) => a + b, 0) 
        },


        hacerCompra(producto){

            let suma = this.sumatoriaCarrito()

           

            let createInvoice = {
                paymentMethods: this.paymentMethods,
                shippingType: this.shippingType,
            }

            Swal.fire({
                title: '¿Desea realizar la compra?',
                text: "Al confirmar, no podrá revertir los cambios",
                icon: 'question',
                showDenyButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Realizar compra',
                denyButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                axios.post("/api/invoices/create", createInvoice)
            // .catch(function (error) {
            //     this.error = error.response.data
            // })
            .then(results =>{
                this.storageCarrito.forEach(producto =>{
                    axios.patch("/api/products", {
                        "id": producto.id,
                        "quantity": producto.cantidad
                    })
                    // .catch(function (error) {
                    //     this.error = error.response.data
                    // })
                    .then(results =>{

                        setTimeout(function () {
                            window.open(`https://homebanking2.herokuapp.com/cardPayments/posnet.html?amount=${suma}`)}, 2000)
                        
                        const eliminarProductoDelCarrito = (arrayOriginal) => {
                            let stockIndex = this.buscarProductoEnArray(producto.id, arrayOriginal);
                            arrayOriginal[stockIndex].stock += 1;
                        }
                        eliminarProductoDelCarrito(this.products)
    
                        this.storageCarrito.splice(this.storageCarrito.indexOf(producto), 1);
                        localStorage.setItem("cart", JSON.stringify(this.storageCarrito));

                    })
                })
            }).then(result =>{
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Orden de compra efectuada. Proceda al pago',
                    showConfirmButton: false,
                    timer: 1500
                })
                setTimeout(function () {
                window.location.href = "/web/purchaseok.html"
            }, 10000)
            })
        } if(result.isDenied){
            Swal.fire({
                position: 'center',
                icon: 'warning',
                title: 'Orden de compra no realizada',
                showConfirmButton: false,
                timer: 1000
            })
            setTimeout(function () {
            window.location.href = "/web/checkout.html"
        }, 1000)
        }
    })
    },

        buscarProductoEnArray(id, array) {
            for (var i = 0; i < array.length; i++) {
                if (array[i].id == id) {
                    return i;
                }
            }
            return -1;
        },

        acceptTyC() {

            const checkbox = document.querySelector("#accept_terms")
            this.checkboxChecked = checkbox.checked
            if (this.checkboxChecked) {
                const {
                    value: accept
                } = Swal.fire({
                    title: 'Términos y condiciones',
                    input: 'checkbox',
                    inputValue: 1,
                    inputPlaceholder: 'Estoy de acuerdo con los términos y condiciones',
                    confirmButtonText: 'Continue <i class="fa fa-arrow-right"></i>',
                    inputValidator: (result) => {
                        return !result && 'Debe aceptar los términos y condiciones'
                    }
                })

                if (accept) {
                    Swal.fire('Ha aceptados los TyC')
                }
            }
        },

        shipping(){

        }


        
    },


    computed:{

        precioTotalCarrito(){
            this.precioTotal = this.subtotalCarrito;
            return this.precioTotal   
        }
    }

}).mount('#app')




var loader = document.getElementById("loader");

window.addEventListener("load", function () {

    setTimeout(() => {
        loader.style.display = "none";
    }, 30);

})