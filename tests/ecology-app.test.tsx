import { StrictMode } from 'react';
import { fireEvent,render,screen } from '@testing-library/react';
import { expect,it,vi } from 'vitest';
import { App } from '../src/app/App';
it('opens the understandable world first and supports selection and stepping in StrictMode',async()=>{
 window.history.replaceState({},'','/');render(<StrictMode><App/></StrictMode>);await Promise.resolve();
 expect(screen.getByTestId('ecology-population')).toHaveTextContent('8');
 fireEvent.click(screen.getByRole('button',{name:'One step'}));expect(screen.getByTestId('ecology-tick')).toHaveTextContent('1');
 fireEvent.change(screen.getByLabelText('Select organism'),{target:{value:'2'}});expect(screen.getByRole('heading',{name:'Organism #2'})).toBeInTheDocument();
 expect(screen.getByText('The mouth takes nearby food. The motor spends energy to move. The body stores resources and evaluates food signals.')).toBeInTheDocument();
});
it('preserves progress on cancelled restart and handles storage failure without losing export',()=>{
 window.history.replaceState({},'','/');render(<App/>);fireEvent.click(screen.getByRole('button',{name:'One step'}));vi.spyOn(window,'confirm').mockReturnValue(false);fireEvent.click(screen.getByRole('button',{name:'Restart world'}));expect(screen.getByTestId('ecology-tick')).toHaveTextContent('1');
 vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw Error('quota');});fireEvent.click(screen.getByRole('button',{name:'Save settings'}));expect(screen.getByRole('status')).toHaveTextContent('Export your starting settings');expect(screen.getByRole('button',{name:'Export starting settings'})).toBeEnabled();
});

it('pauses the new world when the tab is hidden',()=>{
 window.history.replaceState({},'','/');render(<App/>);fireEvent.click(screen.getByRole('button',{name:'Start world'}));expect(screen.getByTestId('ecology-status')).toHaveTextContent('running');
 Object.defineProperty(document,'hidden',{configurable:true,value:true});fireEvent(document,new Event('visibilitychange'));expect(screen.getByTestId('ecology-status')).toHaveTextContent('paused');Object.defineProperty(document,'hidden',{configurable:true,value:false});
});
