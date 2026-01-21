const db = require("../config/firebase");

async function test() {
    await db.collection("test").add({
        message: "Firebase connected",
        created_at: new Date(),
    });

    console.log("Firestore OK");
}

test();
