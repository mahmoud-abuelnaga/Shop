// Elements
const main = document.querySelector("main");
const grid = document.querySelector(".grid");
const pagination = document.querySelector(".pagination");
const deleteButtons = document.querySelectorAll(".deleteBtn");

console.log(deleteButtons);
for (let btn of deleteButtons) {
    btn.addEventListener("click", async () => {
        const token = btn.parentElement.querySelector(
            "input[name='token']"
        ).value;
        const productId = btn.parentElement.querySelector(
            "input[name='productId']"
        ).value;

        const response = await fetch(`/admin/products/${productId}`, {
            method: "DELETE",
            headers: {
                token,
            },
        });

        if (response.status == 200) {
            const productArticle = btn.closest("article");
            productArticle.remove();

            const topArticle = grid.querySelector(".card.product-item");
            if (!topArticle) {
                const urlParams = new URLSearchParams(window.location.search);
                const page = parseInt(urlParams.get("page"));

                if (!page || page == 1) {
                    grid.remove();
                    pagination.remove();

                    const h1 = document.createElement("h1");
                    h1.appendChild(
                        document.createTextNode("No Products Found!")
                    );
                    main.appendChild(h1);
                } else {
                    window.location.replace(`/admin/products?page=${page - 1}`);
                }
            }
        } else if (response.status == 500) {
            window.location.replace("/500");
        } else if (response.status == 403) {
            window.location.replace("/authentication-error");
        }
    });
}
