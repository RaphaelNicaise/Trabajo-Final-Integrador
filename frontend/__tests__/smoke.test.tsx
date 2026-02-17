import { render, screen } from '@testing-library/react';

describe('Ambiente de Frontend', () => {
    it('debería renderizar un componente básico', () => {
        render(<h1>StoreHub Test</h1>);
        expect(screen.getByText('StoreHub Test')).toBeInTheDocument();
    });
});