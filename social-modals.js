(() => {
    const triggers = document.querySelectorAll("[data-social-modal]");
    const modals = document.querySelectorAll(".qr-modal");
    if (!triggers.length || !modals.length) return;

    let activeModal = null;
    let opener = null;
    let previousOverflow = "";

    function closeModal() {
        if (!activeModal) return;
        activeModal.classList.remove("show");
        document.body.style.overflow = previousOverflow;
        activeModal = null;
        opener?.focus();
        opener = null;
    }

    triggers.forEach((trigger) => {
        trigger.addEventListener("click", () => {
            const modal = document.getElementById(trigger.dataset.socialModal);
            if (!modal) return;
            if (activeModal) closeModal();
            opener = trigger;
            previousOverflow = document.body.style.overflow;
            activeModal = modal;
            modal.classList.add("show");
            document.body.style.overflow = "hidden";
            modal.querySelector(".modal-close")?.focus();
        });
    });

    modals.forEach((modal) => {
        modal.addEventListener("click", (event) => {
            if (event.target === modal || event.target.closest(".modal-close, .social-link")) {
                closeModal();
            }
        });
    });

    document.addEventListener("keydown", (event) => {
        if (!activeModal) return;
        if (event.key === "Escape") {
            event.preventDefault();
            closeModal();
            return;
        }
        if (event.key !== "Tab") return;
        const focusable = [...activeModal.querySelectorAll("button, a[href]")]
            .filter((element) => element.getClientRects().length);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    });
})();
