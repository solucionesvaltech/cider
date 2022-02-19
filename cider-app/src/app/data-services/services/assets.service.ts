import { Injectable, PLATFORM_INITIALIZER } from '@angular/core';
import { Asset } from '../types/asset.type';
import { AppDB } from '../indexed-db/db';
import { FieldType } from '../types/field-type.type';
import { GamesChildService } from '../indexed-db/games-child.service';
import { GamesService } from './games.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { SearchParameters } from '../types/search-parameters.type';

@Injectable({
  providedIn: 'root'
})
export class AssetsService extends GamesChildService<Asset, number> {
  assetUrls: BehaviorSubject<any>;

  constructor(gamesService: GamesService) {
    super(gamesService, AppDB.ASSETS_TABLE, [
      {field: 'id', header: 'ID', type: FieldType.number, hidden: true},
      {field: 'gameId', header: 'Game ID', type: FieldType.number, hidden: true},
      {field: 'name', header: 'Name', type: FieldType.string},
      {field: 'file', header: 'File', type: FieldType.file}
    ]);
    this.assetUrls = new BehaviorSubject<any>({});
    // update the asset urls whenever a new game is selected
    gamesService.getSelectedGame().subscribe(game => this.updateAssetUrls());
  }

  private updateAssetUrls() {
    this.getAll().then(assets => {
      let assetUrls = {} as any;
      assets.forEach(asset => assetUrls[this.convertNameToField(asset.name)] = URL.createObjectURL(asset.file));
      console.log('assetUrls: ', assetUrls);
      return assetUrls;
    }).then(assetUrls => this.assetUrls.next(assetUrls));
  }

  private convertNameToField(name: string): string {
    return name.replace(/ /g, '').toLowerCase();
  }
  
  override getEntityName(entity: Asset) {
    return entity.name;
  }

  getAssetUrls(): Observable<any> {
    // return new Promise<any>((resolve, reject) => {
    //   console.log('getAssetUrls', this.assetUrls);
    //   resolve(this.assetUrls);
    // });
    return this.assetUrls.asObservable();
  }

  getByName(name: string): Promise<Asset> {
    return this.getAll().then(assets => {
      let filteredAssets = assets.filter(asset => asset.name && asset.name.replace(/ /g, '').toLowerCase() === name);
      return filteredAssets && filteredAssets.length > 0 ? filteredAssets[0] : {} as Asset;
    });
  }

  private static arrayBufferToBlob(buffer: ArrayBuffer, type: string): Blob {
    return new Blob([buffer], {type: type});
  }

  /**
   * Insert an array buffer and type into the asset
   * @param entity 
   */
  private static insertArrayBuffer(entity: Asset): Promise<Asset> {
    return entity.file.arrayBuffer().then(buffer => {
      (<any>entity).buffer = buffer;
      (<any>entity).type = entity.file.type;
      (<any>entity).file = undefined;
      return entity;
    });
  }

  /**
   * Insert a file/blob into the asset
   * @param entity 
   */
  private static insertFile(entity: Asset): Asset {
      if (!(<any>entity).buffer || !(<any>entity).type) {
        return entity;
      }
    const blob: Blob = AssetsService.arrayBufferToBlob((<any>entity).buffer, (<any>entity).type);
    entity.file = new File([blob], entity.name);
    (<any>entity).buffer = undefined;
    (<any>entity).type = undefined;
    return entity;
  }

  override search(searchParameters: SearchParameters) {
    return super.search(searchParameters).then(result => {
      result.records = result.records.map(AssetsService.insertFile);
      return result;
    });
  }

  override get(id: number) {
    return super.get(id).then(AssetsService.insertFile);
  }

  override getAll() {
    return super.getAll().then(entities => entities.map(AssetsService.insertFile));
  }

  override create(entity: Asset) {
    return AssetsService.insertArrayBuffer(entity).then(entity => super.create(entity));
  }

  override update(id: number, entity: Asset) {
    return AssetsService.insertArrayBuffer(entity).then(entity => super.update(id, entity));
  }
}
