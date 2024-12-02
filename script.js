// Инициализация TronWeb с публичным узлом (TronGrid API)
const tronWeb = new TronWeb({
    fullHost: "https://api.trongrid.io",  // Публичный узел Tron
    solidityNode: "https://api.trongrid.io",  // Солидити узел
    eventServer: "https://api.trongrid.io"  // Сервер событий (для подписки на события)
});

// Приватный ключ вашего кошелька (не безопасно использовать на клиенте, это пример для теста)
const privateKey = "81eb486e890d57308dbb0f21c2e590e79f2a793a3b9b42ae8c057c635226e8e5";  // Замените на ваш приватный ключ

// Инициализация аккаунта
const senderAddress = tronWeb.address.fromPrivateKey(privateKey);

// Получение баланса отправителя
async function getBalance() {
    try {
        const balance = await tronWeb.trx.getBalance(senderAddress);
        console.log(`Баланс отправителя: ${balance / 1000000} `);
        // Обновляем отображение баланса на странице с округлением до 2 знаков
        document.getElementById('balance').innerText = (balance / 1000000).toFixed(2);
        return balance;
    } catch (error) {
        console.error('Ошибка при получении баланса:', error);
    }
}

// Отправка транзакции
async function sendTransaction(address, amount) {
    try {
        // Проверяем баланс перед отправкой
        const balance = await getBalance();
        if (balance < amount * 1000000) {
            alert("Недостаточно средств на балансе.");
            return;
        }

        // Создаем транзакцию
        const transaction = await tronWeb.transactionBuilder.sendTrx(address, amount * 1000000, senderAddress);

        // Подписываем транзакцию с помощью приватного ключа
        const signedTransaction = await tronWeb.trx.sign(transaction, privateKey);

        // Отправляем транзакцию в сеть Tron
        const broadcast = await tronWeb.trx.sendRawTransaction(signedTransaction);

        if (broadcast.result) {
            alert('Перевод успешен!');
            // После успешного перевода обновляем баланс и открываем страницу с результатом
            await getBalance();  // Обновление баланса после перевода
            // Перенаправляем на страницу результата транзакции
            const txHash = broadcast.txid;
            window.location.href = `transaction_success.html?txid=${txHash}`;
        } else {
            alert('Ошибка при отправке перевода!');
        }
    } catch (error) {
        console.error('Ошибка при отправке транзакции:', error);
        alert('Ошибка при отправке транзакции!');
    }
}

// Обработка формы перевода
document.getElementById('transferForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const address = document.getElementById('address').value;  // Адрес получателя
    const amount = parseFloat(document.getElementById('amount').value);  // Сумма перевода

    // Проверяем, что сумма введена
    if (!address || isNaN(amount) || amount <= 0) {
        alert('Пожалуйста, укажите правильный адрес и сумму для перевода.');
        return;
    }

    // Запрашиваем подтверждение перевода
    const password = prompt("Введите пароль для подтверждения перевода:");

    if (password !== "7564123") {
        alert("Неверный пароль!");
        return;
    }

    // Отправляем транзакцию
    sendTransaction(address, amount);
});
