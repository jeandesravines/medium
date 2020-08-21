import FirebaseAdmin from 'firebase-admin';
import * as configuration from '../../configuration';

const serviceAccount = configuration.firebase.serviceAccount as string
const credential = FirebaseAdmin.credential.cert(serviceAccount)
const firebase = FirebaseAdmin.initializeApp({ credential })

export default firebase
