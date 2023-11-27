import { Component } from 'react';
import { Error } from '@/components/Errors/Error';

export class ErrorBoundary extends Component {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if ((this.state as any)?.hasError) {
      return <Error />;
    }
    return (this.props as any).children;
  }
}