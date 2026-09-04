sed -i '/match \/checkins\/{checkinId} {/i \
      match /appointments/{appointmentId} {\n        allow read: if isOwner(userId);\n        allow create: if isOwner(userId) && isValidId(appointmentId);\n        allow update: if isOwner(userId);\n        allow delete: if isOwner(userId);\n      }' firestore.rules
