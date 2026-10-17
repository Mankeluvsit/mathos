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
 window.history.replaceState({},'','/');render(<App/>);fireEvent.click(screen.getByRole('button',{name:'One step'}));vi.spyOn(window,'confirm').mockReturnValue(false);fireEvent.click(screen.getByText('Restart current world'));fireEvent.click(screen.getByRole('button',{name:'Restart world'}));expect(screen.getByTestId('ecology-tick')).toHaveTextContent('1');
 vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw Error('quota');});fireEvent.click(screen.getByRole('button',{name:'Save settings'}));expect(screen.getAllByRole('status').some(el => el.textContent?.includes('Export your starting settings'))).toBe(true);expect(screen.getByRole('button',{name:'Export starting settings'})).toBeEnabled();
});

it('pauses the new world when the tab is hidden',()=>{
 window.history.replaceState({},'','/');render(<App/>);fireEvent.click(screen.getByRole('button',{name:'Start world'}));expect(screen.getByTestId('ecology-status')).toHaveTextContent('running');
 Object.defineProperty(document,'hidden',{configurable:true,value:true});fireEvent(document,new Event('visibilitychange'));expect(screen.getByTestId('ecology-status')).toHaveTextContent('paused');Object.defineProperty(document,'hidden',{configurable:true,value:false});
});

it('keeps legacy starting files runnable and shows their fixed-facing limitation',()=>{
 window.history.replaceState({},'','/');render(<App/>);
 fireEvent.change(screen.getByLabelText('Simulation model'),{target:{value:'1'}});
 fireEvent.click(screen.getByRole('button',{name:'Prepare new world'}));
 expect(screen.getByText(/Legacy model 1: fixed-facing sliding bodies/)).toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'One step'}));expect(screen.getByTestId('ecology-tick')).toHaveTextContent('1');
});

it('runs the learning controller and keeps draft learning changes separate until preparing a world',()=>{
 window.history.replaceState({},'','/');render(<App/>);
 expect(screen.getByTestId('learning-mode')).toHaveTextContent('Learning on');
 expect(screen.getByTestId('learning-updates')).toHaveTextContent('0');
 fireEvent.click(screen.getByRole('button',{name:'One step'}));
 expect(screen.getByTestId('learning-updates')).toHaveTextContent('1');
 expect(screen.getByTestId('learning-decision')).toHaveTextContent('Step 1');
 fireEvent.click(screen.getByLabelText('Enable lifetime learning'));
 expect(screen.getByTestId('learning-mode')).toHaveTextContent('Learning on');
 vi.spyOn(window,'confirm').mockReturnValue(true);
 fireEvent.click(screen.getByRole('button',{name:'Prepare new world'}));
 expect(screen.getByTestId('learning-mode')).toHaveTextContent('Learning off');
 fireEvent.click(screen.getByRole('button',{name:'One step'}));
 expect(screen.getByTestId('learning-updates')).toHaveTextContent('0');
 expect(screen.getByTestId('learning-reward')).toHaveTextContent('Reward:');
});

it('explains highlights separately from playback and preserves the world when toggling them',()=>{
 window.history.replaceState({},'','/');render(<App/>);
 fireEvent.click(screen.getByText('View controls'));
 expect(screen.getByTestId('playback-summary')).toHaveTextContent('Paused — Start world to move organisms');
 expect(screen.getByLabelText('Activity highlights')).toHaveAccessibleDescription(/They do not start playback/);
 fireEvent.click(screen.getByLabelText('Activity highlights'));
 expect(screen.getByTestId('ecology-tick')).toHaveTextContent('0');
 expect(screen.getByTestId('ecology-status')).toHaveTextContent('paused');
 fireEvent.click(screen.getByRole('button',{name:'Start world'}));
 expect(screen.getByTestId('playback-summary')).toHaveTextContent('Running');
});
