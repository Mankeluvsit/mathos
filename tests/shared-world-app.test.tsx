import {fireEvent,render,screen} from '@testing-library/react';
import {expect,it,vi} from 'vitest';
import {App} from '../src/app/App';
it('opens one canonical world and testing tools preserve its active tick and configuration',()=>{
 window.history.replaceState({},'','/');render(<App/>);
 expect(screen.getAllByRole('img',{name:'Shared organism world'})).toHaveLength(1);expect(screen.queryByRole('button',{name:'Open test field'})).not.toBeInTheDocument();
 fireEvent.click(screen.getByRole('button',{name:'One world step'}));expect(screen.getByTestId('test-field-progress')).toHaveTextContent('1 / 1600');
 fireEvent.click(screen.getByLabelText('Testing tools · same world'));expect(screen.getByRole('button',{name:'Add food'})).toBeInTheDocument();expect(screen.getByTestId('test-field-progress')).toHaveTextContent('1 / 1600');
 fireEvent.click(screen.getByLabelText('Testing tools · same world'));expect(screen.queryByRole('button',{name:'Add food'})).not.toBeInTheDocument();expect(screen.getByTestId('test-field-progress')).toHaveTextContent('1 / 1600');
});
it('synchronizes nullable limits and inheritance controls with hidden JSON without applying them silently',()=>{
 window.history.replaceState({},'','/');render(<App/>);fireEvent.click(screen.getAllByRole('button',{name:'Show JSON'})[0]!);
 fireEvent.click(screen.getByLabelText('Stop at chosen step'));fireEvent.click(screen.getByLabelText('Cap available food energy'));fireEvent.click(screen.getByLabelText('Limit total replenishment'));fireEvent.click(screen.getByLabelText('Offspring inherit controller weights · experimental'));
 const config=JSON.parse((screen.getByLabelText('Editable configuration JSON') as HTMLTextAreaElement).value);expect(config.test.steps).toBe(null);expect(config.rules.foodCap).toBe(null);expect(config.rules.supplyBudget).toBe(null);expect(config.organisms.inheritWeights).toBe(true);
 expect(screen.getByTestId('test-field-progress')).toHaveTextContent('0 / 1600');fireEvent.click(screen.getByRole('button',{name:'Apply live settings'}));expect(screen.getByTestId('test-field-progress')).toHaveTextContent('until paused');
 const json=screen.getByLabelText('Editable configuration JSON');fireEvent.change(json,{target:{value:'{bad'}});expect(screen.getByRole('button',{name:'Apply live settings'})).toBeDisabled();fireEvent.click(screen.getAllByRole('button',{name:'Hide JSON'})[0]!);fireEvent.click(screen.getAllByRole('button',{name:'Show JSON'})[0]!);expect(screen.getByLabelText('Editable configuration JSON')).toHaveValue('{bad');
});
it('requires confirmation before replacing a progressed world and preserves it on cancel',()=>{
 vi.spyOn(window,'confirm').mockReturnValue(false);window.history.replaceState({},'','/');render(<App/>);fireEvent.click(screen.getByRole('button',{name:'One world step'}));fireEvent.click(screen.getByRole('button',{name:'Prepare world · reset'}));expect(screen.getByTestId('test-field-progress')).toHaveTextContent('1 / 1600');
});
it('does not export an accidentally unlimited rule when a nullable numeric limit is cleared',()=>{
 window.history.replaceState({},'','/');render(<App/>);
 fireEvent.change(screen.getByLabelText('Stopping step'),{target:{value:''}});
 expect(screen.getByRole('button',{name:'Apply live settings'})).toBeDisabled();
 expect(screen.getByRole('button',{name:'Save JSON file'})).toBeDisabled();
 expect(screen.getByRole('button',{name:'Save in browser'})).toBeDisabled();
 expect(screen.getByTestId('test-field-progress')).toHaveTextContent('0 / 1600');
});
