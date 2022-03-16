import  App from './App';
import { SSRProvider } from 'react-bootstrap';

const Index = () => {
    return (
        <SSRProvider>
        <App />
        </SSRProvider>
    )
}

export default Index