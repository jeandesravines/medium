import admin from 'firebase-admin'
import * as configuration from '../../configuration'

const serviceAccount = configuration.firebase.serviceAccount as string
const credential = admin.credential.cert(serviceAccount)

admin.initializeApp({ credential })
admin.firestore().settings(configuration.firestore)

export default admin
